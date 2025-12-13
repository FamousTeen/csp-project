"use client";

import AdminLayout from "@/app/components/AdminLayout";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Image from "next/image";

// Define Types
type Order = {
  id: string;
  user_id: string;
  qty: number;
  total_price: number;
  status: string;
  created_at: string;
};

type EventParams = {
  id: string;
};

export default function EditEventPage({
  params,
}: {
  params: Promise<EventParams>;
}) {
  const { id } = use(params);
  const router = useRouter();

  // Loading States
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Form & File States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    image: "",
    start_at: "",
    end_at: "",
    price: 0,
    qty: 0,
    published: false,
    featured: false,
  });

  // Orders & Modal States
  const [orders, setOrders] = useState<Order[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [manualOrder, setManualOrder] = useState({
    user_id: "",
    qty: 1,
  });

  // --- 1. FETCH LOGIC ---

  // Define this outside useEffect so we can reuse it to refresh the table
  const fetchOrders = async () => {
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("concert_id", id)
      .order("created_at", { ascending: false });

    if (!orderError && orderData) {
      setOrders(orderData);
    }
  };

  useEffect(() => {
    const fetchEventData = async () => {
      // A. Get Event Details
      const { data: event, error } = await supabase
        .from("concerts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching event:", error);
        alert("Event not found!");
        router.push("/admin/events");
        return;
      }

      const formatForInput = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toISOString().slice(0, 16);
      };

      setFormData({
        title: event.title,
        description: event.description || "",
        location: event.location,
        image: event.image,
        start_at: formatForInput(event.start_at),
        end_at: formatForInput(event.end_at),
        price: event.price,
        qty: event.qty,
        published: event.published,
        featured: event.featured,
      });

      if (event.image) {
        setImagePreview(
          event.image.startsWith("http") ? event.image : `/${event.image}`
        );
      }

      // B. Get Orders
      await fetchOrders();

      // C. Prefill Modal User ID (Optional: Current Admin ID)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setManualOrder((prev) => ({ ...prev, user_id: user.id }));

      setFetchLoading(false);
    };

    fetchEventData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router]);

  // --- 2. HANDLERS ---
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);

    if (!manualOrder.user_id) {
      alert("Please enter a User UUID");
      setModalLoading(false);
      return;
    }

    const totalPrice = manualOrder.qty * formData.price;

    const { error } = await supabase.from("orders").insert({
      concert_id: id,
      user_id: manualOrder.user_id,
      qty: manualOrder.qty,
      total_price: totalPrice,
      status: "success",
    });

    if (error) {
      alert("Failed to create order: " + error.message);
    } else {
      await fetchOrders(); // Refresh table
      setShowModal(false);
      setManualOrder((prev) => ({ ...prev, qty: 1 })); // Reset qty
    }
    setModalLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalImageUrl = formData.image;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(fileName, imageFile);

      if (!uploadError) {
        const { data } = supabase.storage
          .from("event-images")
          .getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      }
    }

    const { data, error } = await supabase
      .from("concerts")
      .update({ ...formData, image: finalImageUrl })
      .eq("id", parseInt(id)) // Force the ID to be a number // Ideally ensure this matches the type: Number(id) if DB is int8
      .select();

    if (error) {
      alert("Failed to update event: " + error.message);
    } else if (data.length === 0) {
      // FIX: This catches the "Silent Failure"
      alert("Update failed: No event found with this ID (Row mismatch).");
    } else {
      alert("Event updated successfully!");
      router.push("/admin/events");
    }
    setLoading(false);
  };

  if (fetchLoading) return <div className="text-white p-10">Loading...</div>;

  return (
    <AdminLayout title="Edit Event">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* --- FORM SECTION --- */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">
              Edit Event: {formData.title}
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-[#0A0F29]/60 border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-sm space-y-8"
          >
            {/* General Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-indigo-400 border-b border-white/5 pb-2">
                General Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Event Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#010314] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#010314] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  rows={4}
                  onChange={handleChange}
                  className="w-full bg-[#010314] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none resize-none"
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-indigo-400 border-b border-white/5 pb-2">
                Schedule
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="start_at"
                    value={formData.start_at}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#010314] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none scheme-dark"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="end_at"
                    value={formData.end_at}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#010314] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none scheme-dark"
                  />
                </div>
              </div>
            </div>

            {/* Ticketing & Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-indigo-400 border-b border-white/5 pb-2">
                Ticketing & Media
              </h3>
              <div className="flex flex-col md:flex-row gap-6 items-start mb-4">
                <div className="w-full md:w-48 h-32 bg-[#010314] border border-white/10 rounded-lg flex items-center justify-center overflow-hidden relative shrink-0">
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-gray-500">No image</span>
                  )}
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <label className="text-sm text-gray-400">Update Banner</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer bg-[#010314] rounded-lg border border-white/10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Price (IDR)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full bg-[#010314] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">
                    Quantity (Seats)
                  </label>
                  <input
                    type="number"
                    name="qty"
                    value={formData.qty}
                    onChange={handleChange}
                    className="w-full bg-[#010314] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-6 flex flex-col md:flex-row gap-8">
              <label className="flex items-center gap-4 cursor-pointer group">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                <span className="text-white font-medium">Publish Event</span>
              </label>
              <label className="flex items-center gap-4 cursor-pointer group">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                <span className="text-white font-medium">Feature Event</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* --- ORDERS TABLE SECTION --- */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Event Orders</h2>
            {/* NEW: Create Order Button */}
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-lg flex items-center gap-2"
            >
              + Create Manual Order
            </button>
          </div>

          <div className="bg-[#0A0F29]/60 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No orders found for this event yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                  <thead className="text-xs uppercase bg-[#010314] text-gray-400">
                    <tr>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">User ID</th>
                      <th className="px-6 py-4">Qty</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-xs">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs truncate max-w-[150px]">
                          {order.user_id}
                        </td>
                        <td className="px-6 py-4">{order.qty}</td>
                        <td className="px-6 py-4 text-white font-medium">
                          Rp {order.total_price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              order.status === "success"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* --- MODAL FOR MANUAL ORDER --- */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0F1530] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4">
                Create Manual Order
              </h3>

              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">
                    User ID (UUID)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ed18ee1d-..."
                    value={manualOrder.user_id}
                    onChange={(e) =>
                      setManualOrder({
                        ...manualOrder,
                        user_id: e.target.value,
                      })
                    }
                    className="w-full bg-[#010314] border border-white/10 rounded-lg px-4 py-2 text-white text-sm font-mono focus:border-indigo-500 outline-none"
                  />
                  <p className="text-xs text-gray-500">
                    Paste the UUID from the Users table
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={manualOrder.qty}
                    onChange={(e) =>
                      setManualOrder({
                        ...manualOrder,
                        qty: parseInt(e.target.value),
                      })
                    }
                    className="w-full bg-[#010314] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5 border border-transparent transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="flex-1 py-2 rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {modalLoading ? "Creating..." : "Confirm Order"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
