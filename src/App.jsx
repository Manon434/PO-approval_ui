import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import EmptyState from "./components/EmptyState";
import PurchaseOrderDetail from "./components/PurchaseOrderDetail";
import ApproveModal from "./components/ApproveModal";
import RejectModal from "./components/RejectModal";
import LoginScreen from "./components/LoginScreen";
import NotificationCenter from "./components/NotificationCenter";
import NewPurchaseOrderModal from "./components/NewPurchaseOrderModal";
import SettingsPanel from "./components/SettingsPanel";
import ToastRegion from "./components/ToastRegion";
import { mockPurchaseOrders, rejectionReasons } from "./data/mockData";
import {
  approvePurchaseOrderInApi,
  fetchCurrentUserFromApi,
  fetchDemoAccessFromApi,
  fetchPurchaseOrdersFromApi,
  fetchSystemStatusFromApi,
  isBackendUnavailable,
  isUnauthorizedError,
  loginInApi,
  logoutFromApi,
  rejectPurchaseOrderInApi,
  setAccessToken,
  syncPurchaseOrdersFromSapInApi,
  updateDemoAccessInApi
} from "./services/purchaseOrdersApi";

const directorRecipient = {
  name: "Ananya Rao",
  role: "Director"
};

function sortOrdersByCreatedDate(orders) {
  return [...orders].sort((left, right) => {
    const dateDifference = new Date(right.orderDetails.createdDate) - new Date(left.orderDetails.createdDate);

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return right.poNumber.localeCompare(left.poNumber);
  });
}

function getApprovalRecipient() {
  return directorRecipient;
}

function buildNotificationFromOrder(order, unread = true) {
  const recipient = getApprovalRecipient(order.totalAmount);

  return {
    id: `notif-${order.id}`,
    poId: order.id,
    poNumber: order.poNumber,
    supplierName: order.supplierName,
    amount: order.totalAmount,
    recipientName: recipient.name,
    recipientRole: recipient.role,
    createdAt: order.orderDetails.createdDate,
    unread,
    message:
      "New purchase order routed directly to director approval."
  };
}

function mergeNotifications(currentNotifications, orders, notifyPendingOnly) {
  const nextMap = new Map(currentNotifications.map((notification) => [notification.poId, notification]));
  const sortedOrders = sortOrdersByCreatedDate(orders);

  for (const order of sortedOrders) {
    const poId = order.id ?? order.poNumber;
    const existing = nextMap.get(poId);

    if (existing) {
      nextMap.set(poId, {
        ...existing,
        poNumber: order.poNumber,
        supplierName: order.supplierName,
        amount: order.totalAmount,
        createdAt: order.orderDetails.createdDate
      });
      continue;
    }

    const shouldNotify = !notifyPendingOnly || order.status === "Pending";
    const notification = buildNotificationFromOrder(order, shouldNotify);
    nextMap.set(poId, notification);
  }

  return Array.from(nextMap.values()).sort((left, right) => {
    return new Date(right.createdAt) - new Date(left.createdAt);
  });
}

function hydratePurchaseOrders(orders) {
  return orders.map((order) => ({
    id: order.id ?? order.poNumber,
    ...order,
    attachments: order.attachments ?? []
  }));
}

function buildNotificationsFromOrders(orders) {
  return sortOrdersByCreatedDate(orders).map((order) =>
    buildNotificationFromOrder(order, order.status === "Pending")
  );
}

function getNextPoNumber(orders) {
  const highestNumber = orders.reduce((maxValue, order) => Math.max(maxValue, Number(order.poNumber)), 4500012344);
  return String(highestNumber + 1);
}

function createPurchaseOrderFromUpload(uploadData, existingOrders) {
  const poNumber = getNextPoNumber(existingOrders);
  const createdAt = new Date().toISOString();
  const authority = getApprovalRecipient();
  const sanitizedSupplier = uploadData.supplierName.replace(/[^a-z0-9]+/gi, " ").trim();
  const supplierSlug = sanitizedSupplier.toLowerCase().replace(/\s+/g, ".");

  return {
    id: poNumber,
    poNumber,
    supplierName: uploadData.supplierName,
    location: uploadData.location,
    totalAmount: uploadData.totalAmount,
    status: "Pending",
    vendorInfo: {
      vendorCode: `VEND-${poNumber.slice(-4)}`,
      gstNumber: `27PO${poNumber.slice(-8)}IND1ZP`,
      address: uploadData.deliveryAddress,
      contact: "+91 22 4000 1100",
      email: `${supplierSlug || "vendor"}@example.com`
    },
    orderDetails: {
      createdDate: createdAt,
      purchaseArea: uploadData.purchaseArea,
      purchaseGroup: "PG-DIR",
      paymentTerms: "Net 30 Days",
      incoterms: "DAP - Delivered at Place"
    },
    deliveryInfo: {
      plant: uploadData.plant,
      deliveryDate: new Date(`${uploadData.deliveryDate}T10:00:00+05:30`).toISOString(),
      deliveryAddress: uploadData.deliveryAddress
    },
    lineItems: [
      {
        itemNumber: "010",
        material: `MAT-${poNumber.slice(-3)}`,
        description: "Uploaded purchase package",
        quantity: 1,
        unit: "LOT",
        price: uploadData.totalAmount
      }
    ],
    approvalHistory: [
      {
        id: `${poNumber}-created`,
        type: "created",
        title: "Created",
        actor: "Riya Nair",
        role: "Procurement Executive",
        time: createdAt,
        note: "Purchase order uploaded through the approval intake workflow."
      },
      {
        id: `${poNumber}-submitted`,
        type: "submitted",
        title: "Submitted for Approval",
        actor: authority.name,
        role: authority.role,
        time: createdAt,
        note: `${authority.role} notification triggered automatically after upload.`
      }
    ]
  };
}

function PurchaseOrderRoute({ visibleOrders, onApprove, onAttachFiles, onRemoveAttachment, onRejectOpen }) {
  const { poId } = useParams();
  const navigate = useNavigate();
  const purchaseOrder = visibleOrders.find((item) => item.id === poId);

  useEffect(() => {
    if (!purchaseOrder) {
      navigate(visibleOrders[0] ? `/po/${visibleOrders[0].id}` : "/", { replace: true });
    }
  }, [navigate, purchaseOrder, visibleOrders]);

  if (!purchaseOrder) {
    return null;
  }

  return (
    <PurchaseOrderDetail
      purchaseOrder={purchaseOrder}
      onApprove={onApprove}
      onAttachFiles={onAttachFiles}
      onRemoveAttachment={onRemoveAttachment}
      onReject={onRejectOpen}
      onBack={() => navigate("/")}
    />
  );
}

export default function App() {
  const attachmentUrlsRef = useRef([]);
  const previousOrderIdsRef = useRef(new Set());
  const hasBootstrappedRef = useRef(false);
  const [purchaseOrders, setPurchaseOrders] = useState(() => hydratePurchaseOrders(mockPurchaseOrders));
  const [rejectingPoId, setRejectingPoId] = useState(null);
  const [approvingPoId, setApprovingPoId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("pending");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authStatus, setAuthStatus] = useState("checking");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [backendDisconnected, setBackendDisconnected] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState(() => buildNotificationsFromOrders(mockPurchaseOrders));
  const [settings, setSettings] = useState(() => {
    try {
      const saved = window.localStorage.getItem("pop-settings");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore local storage parsing errors.
    }

    return {
      autoRefresh: true,
      refreshInterval: 15,
      notifyPendingOnly: true,
      autoReadNotifications: false,
      playSound: true,
      canManageDemoAccess: false,
      demoAccessEnabled: true
    };
  });
  const navigate = useNavigate();
  const location = useLocation();

  // const pendingOrders = sortOrdersByCreatedDate(purchaseOrders.filter((item) => item.status === "Pending"));
  // const approvedOrders = sortOrdersByCreatedDate(purchaseOrders.filter((item) => item.status === "Approved"));
  // const rejectedOrders = sortOrdersByCreatedDate(purchaseOrders.filter((item) => item.status === "Rejected"));
  // const approvedTotalAmount = approvedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  // const ordersBySection = {
  //   pending: pendingOrders,
  //   approved: approvedOrders,
  //   rejected: rejectedOrders
  // };
  // const visibleOrders = ordersBySection[activeSection] ?? pendingOrders;
  // const approvingOrder = purchaseOrders.find((item) => item.id === approvingPoId) ?? null;
  // const rejectingOrder = purchaseOrders.find((item) => item.id === rejectingPoId) ?? null;
  // const unreadNotifications = notifications.filter((notification) => notification.unread).length;

  // ✅ FIX 1: Wrap all filtered lists in useMemo to stop the infinite re-render loop
  const pendingOrders = useMemo(() => 
    sortOrdersByCreatedDate(purchaseOrders.filter((item) => item.status === "Pending")),
    [purchaseOrders]
  );

  const approvedOrders = useMemo(() => 
    sortOrdersByCreatedDate(purchaseOrders.filter((item) => item.status === "Approved")),
    [purchaseOrders]
  );

  const rejectedOrders = useMemo(() => 
    sortOrdersByCreatedDate(purchaseOrders.filter((item) => item.status === "Rejected")),
    [purchaseOrders]
  );

  const visibleOrders = useMemo(() => {
    const ordersBySection = {
      pending: pendingOrders,
      approved: approvedOrders,
      rejected: rejectedOrders
    };
    return ordersBySection[activeSection] ?? pendingOrders;
  }, [activeSection, pendingOrders, approvedOrders, rejectedOrders]);

  const approvedTotalAmount = useMemo(() => 
    approvedOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    [approvedOrders]
  );

  // Keep these as they are
  const approvingOrder = purchaseOrders.find((item) => item.id === approvingPoId) ?? null;
  const rejectingOrder = purchaseOrders.find((item) => item.id === rejectingPoId) ?? null;
  const unreadNotifications = notifications.filter((notification) => notification.unread).length;
  const currentDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(new Date()),
    []
  );

  useEffect(() => {
    setSidebarOpen(false);
    setNotificationsOpen(false);
    setSettingsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let active = true;

    async function loadPurchaseOrders(options = {}) {
      try {
        const apiOrders = await fetchPurchaseOrdersFromApi();

        if (!active) {
          return;
        }

        if (apiOrders.length === 0 && options.preserveExistingWhenEmpty) {
          return;
        }

        const hydratedOrders = hydratePurchaseOrders(apiOrders);
        setPurchaseOrders(hydratedOrders);
        setNotifications((currentNotifications) =>
          mergeNotifications(currentNotifications, hydratedOrders, settings.notifyPendingOnly)
        );
        if (hasBootstrappedRef.current) {
          const previousIds = previousOrderIdsRef.current;
          const newOrders = hydratedOrders.filter((order) => !previousIds.has(order.id));
          handleNewOrdersNotification(newOrders);
        }
        previousOrderIdsRef.current = new Set(hydratedOrders.map((order) => order.id));
        setBackendDisconnected(false);
      } catch (error) {
        if (isBackendUnavailable(error)) {
          setBackendDisconnected(true);
        } else {
          console.warn("[frontend] Backend fetch failed:", error.message);
        }
      }
    }

    async function loadSystemStatus() {
      try {
        const statusPayload = await fetchSystemStatusFromApi();

        if (!active) {
          return;
        }

        setSystemStatus(statusPayload);
        setBackendDisconnected(false);
      } catch (error) {
        if (isBackendUnavailable(error)) {
          setBackendDisconnected(true);
        }
      }
    }

    async function bootstrapAuth() {
      await loadSystemStatus();

      try {
        const authPayload = await fetchCurrentUserFromApi();

        if (!active) {
          return;
        }

        setCurrentUser(authPayload.user);
        setAuthStatus("authenticated");
        setIsDemoMode(false);
        if (authPayload.user.role === "Director") {
          const demoAccess = await fetchDemoAccessFromApi();
          setSettings((currentSettings) => ({
            ...currentSettings,
            canManageDemoAccess: true,
            demoAccessEnabled: demoAccess.enabled
          }));
        }
        await loadPurchaseOrders();
        hasBootstrappedRef.current = true;
      } catch (error) {
        if (!active) {
          return;
        }

        if (isBackendUnavailable(error)) {
          setAuthStatus("demo");
          setIsDemoMode(true);
          setBackendDisconnected(true);
          showToast("warning", "Demo mode enabled", "Backend auth is unavailable, so the app is using local demo data.");
          return;
        }

        if (isUnauthorizedError(error)) {
          setAuthStatus("unauthenticated");
          setIsDemoMode(false);
          return;
        }

        setAuthStatus("unauthenticated");
        setLoginError(error.message);
      }
    }

    bootstrapAuth();

    return () => {
      active = false;
    };
  }, []);

  useEffect(
    () => () => {
      attachmentUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    []
  );

  useEffect(() => {
    if (toasts.length === 0) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToasts((currentToasts) => currentToasts.slice(1));
    }, 3200);

    return () => window.clearTimeout(timeoutId);
  }, [toasts]);

  function showToast(type, title, message) {
    setToasts((currentToasts) => [
      ...currentToasts,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        title,
        message
      }
    ]);
  }

  function playNotificationTone() {
    if (!settings.playSound) {
      return;
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        return;
      }
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, context.currentTime);
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.3);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.35);
      oscillator.onended = () => context.close();
    } catch {
      // Ignore audio failures.
    }
  }

  function handleNewOrdersNotification(newOrders) {
    if (!newOrders.length) {
      return;
    }

    const pendingNew = settings.notifyPendingOnly
      ? newOrders.filter((order) => order.status === "Pending")
      : newOrders;

    if (pendingNew.length === 0) {
      return;
    }

    showToast(
      "success",
      "New purchase orders received",
      `${pendingNew.length} new PO${pendingNew.length > 1 ? "s" : ""} added to the queue.`
    );
    playNotificationTone();
  }

  async function handleLogin(credentials) {
    setLoginLoading(true);
    setLoginError("");

    try {
      const loginPayload = await loginInApi(credentials);
      setBackendDisconnected(false);
      setCurrentUser(loginPayload.user);
      setAuthStatus("authenticated");
      setIsDemoMode(false);
      if (loginPayload.accessToken) {
        setAccessToken(loginPayload.accessToken);
      }

      if (loginPayload.user.role === "Director") {
        const demoAccess = await fetchDemoAccessFromApi();
        setSettings((currentSettings) => ({
          ...currentSettings,
          canManageDemoAccess: true,
          demoAccessEnabled: demoAccess.enabled
        }));
      } else {
        setSettings((currentSettings) => ({
          ...currentSettings,
          canManageDemoAccess: false
        }));
      }

      const apiOrders = await fetchPurchaseOrdersFromApi();
      const hydratedOrders = hydratePurchaseOrders(apiOrders);
      setPurchaseOrders(hydratedOrders);
      setNotifications((currentNotifications) =>
        mergeNotifications(currentNotifications, hydratedOrders, settings.notifyPendingOnly)
      );
      previousOrderIdsRef.current = new Set(hydratedOrders.map((order) => order.id));
      hasBootstrappedRef.current = true;
      const statusPayload = await fetchSystemStatusFromApi();
      setSystemStatus(statusPayload);
      showToast("success", "Secure session started", "You are signed in and protected API access is enabled.");
    } catch (error) {
      if (isBackendUnavailable(error)) {
        setAuthStatus("demo");
        setIsDemoMode(true);
        setBackendDisconnected(true);
        showToast("warning", "Demo mode enabled", "Backend auth is unavailable, so the app is using local demo data.");
      } else {
        setLoginError(error.message);
      }
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await logoutFromApi();
    } catch {
      // Ignore logout transport issues and still clear local state.
    }

    setAccessToken("");
    setCurrentUser(null);
    setAuthStatus("unauthenticated");
    setNotificationsOpen(false);
    setSidebarOpen(false);
    showToast("success", "Signed out", "Your secure session has been closed.");
  }

  function createAttachmentRecords(files) {
    return files.map((file, index) => {
      const url = URL.createObjectURL(file);
      attachmentUrlsRef.current.push(url);

      return {
        id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        size: file.size,
        mimeType: file.type,
        category: file.type === "application/pdf" ? "PO PDF" : "Supporting Document",
        uploadedAt: new Date().toISOString(),
        url
      };
    });
  }

  function markAllNotificationsRead() {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        unread: false
      }))
    );
  }

  useEffect(() => {
    if (!notificationsOpen || !settings.autoReadNotifications) {
      return;
    }

    markAllNotificationsRead();
  }, [notificationsOpen, settings.autoReadNotifications]);

  useEffect(() => {
    if (!settings.autoRefresh || authStatus !== "authenticated" || isDemoMode) {
      return undefined;
    }

    const intervalMs = Math.max(5, settings.refreshInterval) * 60 * 1000;

    const intervalId = window.setInterval(async () => {
      try {
        const apiOrders = await fetchPurchaseOrdersFromApi();
        const hydratedOrders = hydratePurchaseOrders(apiOrders);
        setPurchaseOrders(hydratedOrders);
        setNotifications((currentNotifications) =>
          mergeNotifications(currentNotifications, hydratedOrders, settings.notifyPendingOnly)
        );
        const previousIds = previousOrderIdsRef.current;
        const newOrders = hydratedOrders.filter((order) => !previousIds.has(order.id));
        handleNewOrdersNotification(newOrders);
        previousOrderIdsRef.current = new Set(hydratedOrders.map((order) => order.id));
        setBackendDisconnected(false);
      } catch (error) {
        if (isBackendUnavailable(error)) {
          setBackendDisconnected(true);
        }
      }
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [authStatus, isDemoMode, settings.autoRefresh, settings.refreshInterval, settings.notifyPendingOnly]);

  function openNotificationOrder(notificationId, poId) {
    const targetOrder = purchaseOrders.find((order) => order.id === poId);

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId ? { ...notification, unread: false } : notification
      )
    );

    if (targetOrder?.status === "Pending") {
      setActiveSection("pending");
      navigate(`/po/${poId}`);
    } else if (targetOrder?.status === "Approved") {
      setActiveSection("approved");
      navigate(`/po/${poId}`);
    } else if (targetOrder?.status === "Rejected") {
      setActiveSection("rejected");
      navigate(`/po/${poId}`);
    } else {
      showToast(
        "error",
        "Order already processed",
        `PO ${targetOrder?.poNumber ?? poId} is no longer available in the director work queues.`
      );
    }

    setNotificationsOpen(false);
  }

  function handleUploadPurchaseOrder(uploadData) {
    const newOrder = {
      ...createPurchaseOrderFromUpload(uploadData, purchaseOrders),
      attachments: createAttachmentRecords(uploadData.attachments ?? [])
    };
    const recipient = getApprovalRecipient();

    setPurchaseOrders((currentOrders) => [newOrder, ...currentOrders]);
    setNotifications((currentNotifications) => [buildNotificationFromOrder(newOrder, true), ...currentNotifications]);
    setUploadModalOpen(false);
    setActiveSection("pending");
    navigate(`/po/${newOrder.id}`);
    setSidebarOpen(false);
    showToast(
      "success",
      `${recipient.role} notified`,
      `${recipient.name} received a new approval alert for PO ${newOrder.poNumber}.`
    );
  }

  async function handleRefreshNow() {
    try {
      if (authStatus === "authenticated" && !isDemoMode) {
        await syncPurchaseOrdersFromSapInApi();
      }

      const apiOrders = await fetchPurchaseOrdersFromApi();
      const hydratedOrders = hydratePurchaseOrders(apiOrders);
      setPurchaseOrders(hydratedOrders);
      setNotifications((currentNotifications) =>
        mergeNotifications(currentNotifications, hydratedOrders, settings.notifyPendingOnly)
      );
      const previousIds = previousOrderIdsRef.current;
      const newOrders = hydratedOrders.filter((order) => !previousIds.has(order.id));
      handleNewOrdersNotification(newOrders);
      previousOrderIdsRef.current = new Set(hydratedOrders.map((order) => order.id));
      setBackendDisconnected(false);
      showToast("success", "Refresh complete", "The latest SAP queue has been loaded.");
    } catch (error) {
      if (isBackendUnavailable(error)) {
        setBackendDisconnected(true);
        showToast("error", "Refresh failed", "Backend is currently unavailable.");
      } else {
        showToast("error", "Refresh failed", error.message);
      }
    }
  }

  function handleAttachFiles(poId, files) {
    const attachmentRecords = createAttachmentRecords(files);

    setPurchaseOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === poId
          ? {
              ...order,
              attachments: [...(order.attachments ?? []), ...attachmentRecords]
            }
          : order
      )
    );

    showToast(
      "success",
      "Attachments added",
      `${attachmentRecords.length} document${attachmentRecords.length > 1 ? "s were" : " was"} attached to PO ${poId}.`
    );
  }

  function handleRemoveAttachment(poId, attachmentId) {
    let removedAttachment = null;

    setPurchaseOrders((currentOrders) =>
      currentOrders.map((order) => {
        if (order.id !== poId) {
          return order;
        }

        removedAttachment = (order.attachments ?? []).find((attachment) => attachment.id === attachmentId) ?? null;

        return {
          ...order,
          attachments: (order.attachments ?? []).filter((attachment) => attachment.id !== attachmentId)
        };
      })
    );

    if (removedAttachment?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(removedAttachment.url);
      attachmentUrlsRef.current = attachmentUrlsRef.current.filter((url) => url !== removedAttachment.url);
    }

    if (removedAttachment) {
      showToast("warning", "Attachment removed", `${removedAttachment.name} was removed from PO ${poId}.`);
    }
  }

  function handleApproveRequest(poId) {
    setApprovingPoId(poId);
  }

  async function handleApprove({ comments }) {
    if (!approvingPoId) {
      return;
    }

    const approvedOrder = purchaseOrders.find((order) => order.id === approvingPoId);
    let backendOrder = null;

    try {
      backendOrder = await approvePurchaseOrderInApi(approvingPoId, { comments });
    } catch (error) {
      if (!isBackendUnavailable(error)) {
        showToast("error", "Approval failed", error.message);
        return;
      }
    }

    setPurchaseOrders((currentOrders) =>
      currentOrders.map((order) => {
        if (order.id !== approvingPoId) {
          return order;
        }

        if (backendOrder) {
          return {
            ...order,
            ...backendOrder,
            attachments: backendOrder.attachments ?? order.attachments ?? []
          };
        }

        return {
          ...order,
          status: "Approved",
          approvalHistory: [
            ...order.approvalHistory,
            {
              id: `${order.id}-approved`,
              type: "approved",
              title: "Approved",
              actor: directorRecipient.name,
              role: directorRecipient.role,
              time: new Date().toISOString(),
              note: comments
            }
          ]
        };
      })
    );
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.poId === approvingPoId ? { ...notification, unread: false } : notification
      )
    );
    setApprovingPoId(null);

    if (approvedOrder) {
      setActiveSection("approved");
      const nextRoute = `/po/${approvedOrder.id}`;
      navigate(nextRoute);
      showToast("success", "Purchase order approved", `${approvedOrder.poNumber} was approved successfully.`);
    }
  }

  async function handleReject({ reason, comments }) {
    if (!rejectingPoId) {
      return;
    }

    const rejectedOrder = purchaseOrders.find((order) => order.id === rejectingPoId);
    let backendOrder = null;

    try {
      backendOrder = await rejectPurchaseOrderInApi(rejectingPoId, { reason, comments });
    } catch (error) {
      if (!isBackendUnavailable(error)) {
        showToast("error", "Rejection failed", error.message);
        return;
      }
    }

    setPurchaseOrders((currentOrders) =>
      currentOrders.map((order) => {
        if (order.id !== rejectingPoId) {
          return order;
        }

        if (backendOrder) {
          return {
            ...order,
            ...backendOrder,
            attachments: backendOrder.attachments ?? order.attachments ?? []
          };
        }

        return {
          ...order,
          status: "Rejected",
          approvalHistory: [
            ...order.approvalHistory,
            {
              id: `${order.id}-rejected`,
              type: "rejected",
              title: "Rejected",
              actor: directorRecipient.name,
              role: directorRecipient.role,
              time: new Date().toISOString(),
              note: comments,
              reason
            }
          ]
        };
      })
    );
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.poId === rejectingPoId ? { ...notification, unread: false } : notification
      )
    );

    setRejectingPoId(null);

    if (rejectedOrder) {
      setActiveSection("rejected");
      const nextRoute = `/po/${rejectedOrder.id}`;
      navigate(nextRoute);
      showToast("warning", "Purchase order rejected", `${rejectedOrder.poNumber} was rejected with comments recorded.`);
    }
  }

  if (authStatus === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_100%)] px-6">
        <div className="rounded-[32px] border border-slate-200 bg-white px-8 py-10 text-center shadow-panel">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Security Check</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Restoring secure session</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">Please wait while the app verifies your access.</p>
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <LoginScreen
        loading={loginLoading}
        error={loginError}
        onLogin={handleLogin}
        backendDisconnected={backendDisconnected}
        systemStatus={systemStatus}
      />
    );
  }

  return (
    <div className="flex h-[100dvh] min-h-screen flex-col overflow-hidden bg-transparent text-slate-900">
      <TopBar
        pendingCount={pendingOrders.length}
        unreadNotifications={unreadNotifications}
        notificationsOpen={notificationsOpen}
        showMenuButton={location.pathname !== "/"}
        onMenuOpen={() => setSidebarOpen(true)}
        onToggleNotifications={() => setNotificationsOpen((currentValue) => !currentValue)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenUpload={() => {
          setUploadModalOpen(true);
          setNotificationsOpen(false);
        }}
        currentDateLabel={currentDateLabel}
        currentUser={currentUser}
        onLogout={isDemoMode ? null : handleLogout}
        showUpload={authStatus === "authenticated" || isDemoMode}
        securityMode={isDemoMode ? "demo" : "secure"}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden xl:flex-row">
        <Sidebar
          orders={visibleOrders}
          activeSection={activeSection}
          pendingCount={pendingOrders.length}
          approvedCount={approvedOrders.length}
          approvedTotalAmount={approvedTotalAmount}
          rejectedCount={rejectedOrders.length}
          onSectionChange={setActiveSection}
          open={sidebarOpen}
          inlineOnMobile={location.pathname === "/"}
          onClose={() => setSidebarOpen(false)}
        />

        <main className={`min-h-0 min-w-0 flex-1 overflow-hidden ${location.pathname === "/" ? "hidden xl:block" : ""}`}>
          <Routes>
            <Route path="/" element={<EmptyState activeSection={activeSection} hasOrders={visibleOrders.length > 0} />} />
            <Route
              path="/po/:poId"
              element={
                <PurchaseOrderRoute
                  visibleOrders={visibleOrders}
                  onApprove={handleApproveRequest}
                  onAttachFiles={handleAttachFiles}
                  onRemoveAttachment={handleRemoveAttachment}
                  onRejectOpen={setRejectingPoId}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <ApproveModal
        open={Boolean(approvingOrder)}
        poNumber={approvingOrder?.poNumber}
        onClose={() => setApprovingPoId(null)}
        onConfirm={handleApprove}
      />
      <RejectModal
        open={Boolean(rejectingOrder)}
        poNumber={rejectingOrder?.poNumber}
        reasons={rejectionReasons}
        onClose={() => setRejectingPoId(null)}
        onConfirm={handleReject}
      />
      <NewPurchaseOrderModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSubmit={handleUploadPurchaseOrder}
      />
      <NotificationCenter
        open={notificationsOpen}
        notifications={notifications}
        unreadCount={unreadNotifications}
        onClose={() => setNotificationsOpen(false)}
        onMarkAllRead={markAllNotificationsRead}
        onOpenOrder={openNotificationOrder}
      />
      <SettingsPanel
        open={settingsOpen}
        settings={settings}
        onChange={async (nextSettings, options = {}) => {
          setSettings(nextSettings);
          try {
            window.localStorage.setItem("pop-settings", JSON.stringify(nextSettings));
          } catch {
            // Ignore local storage errors.
          }

          if (options.persistRemote && currentUser?.role === "Director") {
            try {
              const demoAccess = await updateDemoAccessInApi(nextSettings.demoAccessEnabled);
              setSettings((currentSettings) => ({
                ...currentSettings,
                demoAccessEnabled: demoAccess.enabled
              }));
              showToast(
                "success",
                demoAccess.enabled ? "Demo login enabled" : "Demo login disabled",
                demoAccess.enabled
                  ? "Clients can sign in with the demo account."
                  : "The client demo account can no longer sign in."
              );
            } catch (error) {
              showToast("error", "Demo access update failed", error.message);
            }
          }
        }}
        onRefreshNow={handleRefreshNow}
        onClose={() => setSettingsOpen(false)}
      />
      <ToastRegion toasts={toasts} />
    </div>
  );
}
