import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import EmptyState from "./components/EmptyState";
import PurchaseOrderDetail from "./components/PurchaseOrderDetail";
import RejectModal from "./components/RejectModal";
import NotificationCenter from "./components/NotificationCenter";
import NewPurchaseOrderModal from "./components/NewPurchaseOrderModal";
import ToastRegion from "./components/ToastRegion";
import { managerLimit, mockPurchaseOrders, rejectionReasons } from "./data/mockData";

const managerRecipient = {
  name: "Arjun Mehta",
  role: "Manager"
};

const directorRecipient = {
  name: "Ananya Rao",
  role: "Director"
};

function getApprovalRecipient(totalAmount) {
  return totalAmount <= managerLimit ? managerRecipient : directorRecipient;
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
      recipient.role === "Manager"
        ? "New purchase order routed directly to manager approval."
        : "New purchase order escalated to director because the amount exceeds manager authority."
  };
}

function getNextPoNumber(orders) {
  const highestNumber = orders.reduce((maxValue, order) => Math.max(maxValue, Number(order.poNumber)), 4500012344);
  return String(highestNumber + 1);
}

function createPurchaseOrderFromUpload(uploadData, existingOrders) {
  const poNumber = getNextPoNumber(existingOrders);
  const createdAt = new Date().toISOString();
  const authority = getApprovalRecipient(uploadData.totalAmount);
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
      purchaseGroup: authority.role === "Manager" ? "PG-OPS" : "PG-CAP",
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

function PurchaseOrderRoute({ pendingOrders, onApprove, onAttachFiles, onRejectOpen }) {
  const { poId } = useParams();
  const navigate = useNavigate();
  const purchaseOrder = pendingOrders.find((item) => item.id === poId);

  useEffect(() => {
    if (!purchaseOrder) {
      navigate(pendingOrders[0] ? `/po/${pendingOrders[0].id}` : "/", { replace: true });
    }
  }, [navigate, pendingOrders, purchaseOrder]);

  if (!purchaseOrder) {
    return null;
  }

  return (
    <PurchaseOrderDetail
      purchaseOrder={purchaseOrder}
      managerLimit={managerLimit}
      onApprove={onApprove}
      onAttachFiles={onAttachFiles}
      onReject={onRejectOpen}
      onBack={() => navigate("/")}
    />
  );
}

export default function App() {
  const attachmentUrlsRef = useRef([]);
  const [purchaseOrders, setPurchaseOrders] = useState(() =>
    mockPurchaseOrders.map((order) => ({
      ...order,
      attachments: order.attachments ?? []
    }))
  );
  const [rejectingPoId, setRejectingPoId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState(() =>
    [...mockPurchaseOrders]
      .sort((left, right) => new Date(right.orderDetails.createdDate) - new Date(left.orderDetails.createdDate))
      .map((order) => buildNotificationFromOrder(order, true))
  );
  const navigate = useNavigate();
  const location = useLocation();

  const pendingOrders = purchaseOrders.filter((item) => item.status === "Pending");
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
  }, [location.pathname]);

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

  function openNotificationOrder(notificationId, poId) {
    const targetOrder = purchaseOrders.find((order) => order.id === poId);

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId ? { ...notification, unread: false } : notification
      )
    );

    if (targetOrder?.status === "Pending") {
      navigate(`/po/${poId}`);
    } else {
      showToast(
        "error",
        "Order already processed",
        `PO ${targetOrder?.poNumber ?? poId} has already moved out of the pending approval queue.`
      );
    }

    setNotificationsOpen(false);
  }

  function handleUploadPurchaseOrder(uploadData) {
    const newOrder = {
      ...createPurchaseOrderFromUpload(uploadData, purchaseOrders),
      attachments: createAttachmentRecords(uploadData.attachments ?? [])
    };
    const recipient = getApprovalRecipient(newOrder.totalAmount);

    setPurchaseOrders((currentOrders) => [newOrder, ...currentOrders]);
    setNotifications((currentNotifications) => [buildNotificationFromOrder(newOrder, true), ...currentNotifications]);
    setUploadModalOpen(false);
    navigate(`/po/${newOrder.id}`);
    setSidebarOpen(false);
    showToast(
      recipient.role === "Manager" ? "success" : "warning",
      `${recipient.role} notified`,
      `${recipient.name} received a new approval alert for PO ${newOrder.poNumber}.`
    );
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

  function handleApprove(poId) {
    const approvedOrder = purchaseOrders.find((order) => order.id === poId);

    setPurchaseOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === poId
          ? {
              ...order,
              status: "Approved",
              approvalHistory: [
                ...order.approvalHistory,
                {
                  id: `${order.id}-approved`,
                  type: "approved",
                  title: "Approved",
                  actor: "Arjun Mehta",
                  role: "Manager",
                  time: new Date().toISOString(),
                  note: "Approved within manager authority."
                }
              ]
            }
          : order
      )
    );
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.poId === poId ? { ...notification, unread: false } : notification
      )
    );

    if (approvedOrder) {
      const nextPendingOrders = pendingOrders.filter((order) => order.id !== poId);
      const nextRoute = nextPendingOrders[0] ? `/po/${nextPendingOrders[0].id}` : "/";
      navigate(nextRoute);
      showToast("success", "Purchase order approved", `${approvedOrder.poNumber} was approved successfully.`);
    }
  }

  function handleReject({ reason, comments }) {
    if (!rejectingPoId) {
      return;
    }

    const rejectedOrder = purchaseOrders.find((order) => order.id === rejectingPoId);

    setPurchaseOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === rejectingPoId
          ? {
              ...order,
              status: "Rejected",
              approvalHistory: [
                ...order.approvalHistory,
                {
                  id: `${order.id}-rejected`,
                  type: "rejected",
                  title: "Rejected",
                  actor: "Arjun Mehta",
                  role: "Manager",
                  time: new Date().toISOString(),
                  note: comments,
                  reason
                }
              ]
            }
          : order
      )
    );
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.poId === rejectingPoId ? { ...notification, unread: false } : notification
      )
    );

    setRejectingPoId(null);

    if (rejectedOrder) {
      const nextPendingOrders = pendingOrders.filter((order) => order.id !== rejectingPoId);
      const nextRoute = nextPendingOrders[0] ? `/po/${nextPendingOrders[0].id}` : "/";
      navigate(nextRoute);
      showToast("warning", "Purchase order rejected", `${rejectedOrder.poNumber} was rejected with comments recorded.`);
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <TopBar
        pendingCount={pendingOrders.length}
        unreadNotifications={unreadNotifications}
        notificationsOpen={notificationsOpen}
        onMenuOpen={() => setSidebarOpen(true)}
        onToggleNotifications={() => setNotificationsOpen((currentValue) => !currentValue)}
        onOpenUpload={() => {
          setUploadModalOpen(true);
          setNotificationsOpen(false);
        }}
        currentDateLabel={currentDateLabel}
      />

      <div className="flex h-[calc(100vh-72px)] flex-col overflow-hidden xl:flex-row">
        <Sidebar
          orders={pendingOrders}
          managerLimit={managerLimit}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="min-h-0 min-w-0 flex-1">
          <Routes>
            <Route path="/" element={<EmptyState hasOrders={pendingOrders.length > 0} />} />
            <Route
              path="/po/:poId"
              element={
                <PurchaseOrderRoute
                  pendingOrders={pendingOrders}
                  onApprove={handleApprove}
                  onAttachFiles={handleAttachFiles}
                  onRejectOpen={setRejectingPoId}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <RejectModal
        open={Boolean(rejectingOrder)}
        poNumber={rejectingOrder?.poNumber}
        reasons={rejectionReasons}
        onClose={() => setRejectingPoId(null)}
        onConfirm={handleReject}
      />
      <NewPurchaseOrderModal
        open={uploadModalOpen}
        managerLimit={managerLimit}
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
      <ToastRegion toasts={toasts} />
    </div>
  );
}
