"use client";

import AdminLayout from "@/app/components/AdminLayout";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image"; // Required for the preview

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // New State for File Upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    image: "", // This will be filled with the Supabase URL after upload
    start_at: "",
    end_at: "",
    price: 0,
    qty: 0,
    published: false,
    featured: false,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    // Handle Checkboxes specifically
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    }
    // Handle Numbers
    else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    }
    // Handle Text/Dates
    else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // --- NEW: Handle File Selection ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Create a local preview URL
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // --- NEW: Upload Helper Function ---
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('event-images') // Your bucket name
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Image upload failed! Please check your storage policies.");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic Validation
    if (!formData.title || !formData.start_at || !formData.end_at) {
      alert("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    let finalImageUrl = formData.image;

    // --- NEW: Upload Process ---
    // If a user selected a file, upload it first
    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (!uploadedUrl) {
        setLoading(false);
        return; // Stop if upload failed
      }
      finalImageUrl = uploadedUrl;
    }

    // Insert into Supabase
    const { error } = await supabase.from("concerts").insert([{
      ...formData,
      image: finalImageUrl // Use the uploaded URL
    }]);

    if (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event: " + error.message);
    } else {
      router.push("/admin/events");
    }
    setLoading(false);
  };

  return (
    <AdminLayout title="Create New Event">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Create New Event</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-[#0A0F29]/60 border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-sm space-y-8"
        >
          {/* Section 1: General Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-indigo-400 border-b border-white/5 pb-2">
              General Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Jazz Night 2024"
                  className="w-full bg-[#010314] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none transition-colors"
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  placeholder="e.g. Jakarta Convention Center"
                  className="w-full bg-[#010314] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none transition-colors"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Description</label>
              <textarea
                name="description"
                rows={4}
                placeholder="Describe the event..."
                className="w-full bg-[#010314] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none transition-colors resize-none"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Section 2: Date & Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-indigo-400 border-b border-white/5 pb-2">
              Schedule
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">
                  Start Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="start_at"
                  required
                  className="w-full bg-[#010314] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none scheme-dark"
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">
                  End Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="end_at"
                  required
                  className="w-full bg-[#010314] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none scheme-dark"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Ticketing & Media (UPDATED WITH IMAGE UPLOAD) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-indigo-400 border-b border-white/5 pb-2">
              Ticketing & Media
            </h3>
            
            {/* Image Upload Area */}
            <div className="flex flex-col md:flex-row gap-6 items-start mb-4">
              {/* Preview Box */}
              <div className="w-full md:w-48 h-32 bg-[#010314] border border-white/10 rounded-lg flex items-center justify-center overflow-hidden relative shrink-0">
                {imagePreview ? (
                  <Image 
                    src={imagePreview} 
                    alt="Preview" 
                    fill 
                    className="object-cover" 
                  />
                ) : (
                  <div className="text-center p-2">
                    <span className="text-xs text-gray-500 block">No image selected</span>
                  </div>
                )}
              </div>

              {/* File Input */}
              <div className="flex-1 space-y-2 w-full">
                <label className="text-sm text-gray-400">Upload Banner (Max 5MB)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2.5 file:px-4
                    file:rounded-lg file:border-0
                    file:text-xs file:font-semibold
                    file:bg-indigo-600 file:text-white
                    hover:file:bg-indigo-700
                    cursor-pointer bg-[#010314] rounded-lg border border-white/10"
                />
                <p className="text-xs text-gray-500">Supported formats: JPG, PNG, WEBP</p>
              </div>
            </div>

            {/* Price & Qty Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Price (IDR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-gray-500">
                    Rp
                  </span>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    placeholder="0"
                    className="w-full bg-[#010314] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-indigo-500 outline-none"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">
                  Quantity (Seats)
                </label>
                <input
                  type="number"
                  name="qty"
                  min="0"
                  placeholder="100"
                  className="w-full bg-[#010314] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Settings (Toggle Switches) */}
          <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-6 flex flex-col md:flex-row gap-8">
            {/* Toggle 1: Publish */}
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  name="published"
                  className="sr-only peer"
                  onChange={handleChange}
                />
                {/* Track */}
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </div>
              <div>
                <span className="block text-white font-medium group-hover:text-indigo-300 transition-colors">
                  Publish Event
                </span>
                <span className="text-xs text-gray-400">
                  Visible to users immediately
                </span>
              </div>
            </label>

            {/* Toggle 2: Featured */}
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  name="featured"
                  className="sr-only peer"
                  onChange={handleChange}
                />
                {/* Track */}
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </div>
              <div>
                <span className="block text-white font-medium group-hover:text-indigo-300 transition-colors">
                  Feature Event
                </span>
                <span className="text-xs text-gray-400">
                  Pin to top of homepage
                </span>
              </div>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Uploading..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}