import { useState, useRef } from "react";
import { Camera, Trash2, User, Phone, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";
import { useAdminProfile } from "../contexts/AdminProfileContext";

export default function AdminSettings() {
  const { profile, updateProfile } = useAdminProfile();

  /* ── Avatar state ── */
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleRemoveAvatar = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── Profile form state ── */
  const [name, setName]   = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const validate = () => {
    const e: { name?: string; phone?: string } = {};
    if (!name.trim()) e.name = "Full name cannot be empty.";
    if (!phone.trim()) e.phone = "Phone number cannot be empty.";
    return e;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setErrors({});
    updateProfile({ name: name.trim(), phone: phone.trim(), avatarUrl: previewUrl });
    toast.success("Profile updated successfully");
  };

  const currentAvatar = previewUrl ?? profile.avatarUrl;

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-[#111827] tracking-tight">Settings</h2>
        <p className="text-gray-500 mt-1 font-medium">Manage your profile information</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">

        {/* ── Profile Picture ───────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-bold text-[#111827] mb-5">Profile Picture</h3>

          <div className="flex items-center gap-6">
            {/* Avatar display */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#B4D330]/40 shadow-sm bg-[#E5F2D9] flex items-center justify-center">
                {currentAvatar ? (
                  <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-[#005B3F]">{profile.initials}</span>
                )}
              </div>
              {/* Camera badge */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#005B3F] hover:bg-[#00432E] rounded-full flex items-center justify-center shadow-md transition-colors border-2 border-white"
                title="Upload photo"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>

            {/* Upload controls */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#005B3F] text-[#005B3F] rounded-lg text-sm font-bold hover:bg-[#005B3F] hover:text-white transition-colors"
              >
                <Camera className="w-4 h-4" />
                Upload New Photo
              </button>

              {currentAvatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-500 rounded-lg text-sm font-medium hover:border-red-300 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              )}

              <p className="text-xs text-gray-400 font-medium">JPG or PNG. Max size 5MB.</p>
            </div>
          </div>
        </div>

        {/* ── Profile Information ───────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-bold text-[#111827] mb-5">Profile Information</h3>

          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-bold text-[#111827] mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })); }}
                  className={clsx(
                    "block w-full pl-10 pr-3 py-3 bg-white border rounded-lg text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B4D330] focus:border-transparent transition-all font-medium sm:text-sm shadow-sm",
                    errors.name ? "border-red-400" : "border-gray-200"
                  )}
                  placeholder="e.g., Admin Officer"
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.name}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-bold text-[#111827] mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: undefined })); }}
                  className={clsx(
                    "block w-full pl-10 pr-3 py-3 bg-white border rounded-lg text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B4D330] focus:border-transparent transition-all font-medium sm:text-sm shadow-sm",
                    errors.phone ? "border-red-400" : "border-gray-200"
                  )}
                  placeholder="e.g., 0821234567"
                />
              </div>
              {errors.phone && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.phone}
                </p>
              )}
            </div>

            {/* Read-only role field */}
            <div>
              <label className="block text-sm font-bold text-[#111827] mb-2">Role</label>
              <input
                type="text" readOnly value="Risk Department"
                className="block w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 font-medium sm:text-sm cursor-not-allowed"
              />
              <p className="mt-1.5 text-xs text-gray-400 font-medium">Role is managed by your system administrator.</p>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#005B3F] hover:bg-[#00432E] text-white font-bold rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B4D330]"
          >
            <CheckCircle2 className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
