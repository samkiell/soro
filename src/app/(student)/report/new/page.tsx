"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

const reportSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(120, "Title is too long"),
  description: z
    .string()
    .min(20, "Please give more details (at least 20 characters)")
    .max(3000, "Description is too long"),
  location: z
    .string()
    .min(3, "Please enter a location")
    .max(200, "Location is too long"),
  incidentType: z
    .string()
    .min(1, "Please select an incident type")
    .refine(
      (val) =>
        [
          "theft",
          "suspicious_activity",
          "harassment",
          "vandalism",
          "safety_hazard",
          "medical_emergency",
          "fire",
          "other",
        ].includes(val),
      { message: "Please select a valid incident type" }
    ),
  urgency: z.enum(["low", "medium", "high", "critical"]),
  isAnonymous: z.boolean(),
  photo: z.any().optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export default function NewReportPage() {
  const router = useRouter();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      urgency: "medium",
      isAnonymous: false,
      incidentType: "",
    },
  });

  const selectedPhoto = watch("photo");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
const [photoInputKey, setPhotoInputKey] = useState(0);
async function onSubmit(data: ReportFormValues) {
  setMessage(null);

  try {
    // Prepare the data that will later be sent to the backend
    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("location", data.location);
    formData.append("incidentType", data.incidentType);
    formData.append("urgency", data.urgency);
    formData.append("isAnonymous", String(data.isAnonymous));

    // Only add the photo if the user selected one
    if (data.photo instanceof File) {
      formData.append("photo", data.photo);
    }

    // Temporary – just show what will be sent
    console.log("FormData ready for backend:");
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Later this is where we will call the real Server Action
    // Example (do not uncomment yet):
    // const result = await createReport(formData);
const savedReports = JSON.parse(
  localStorage.getItem("soro-submitted-reports") || "[]"
) as Array<{
  id: string;
  title: string;
  location: string;
  status: "Pending" | "Investigating" | "Resolved" | "Rejected";
  date: string;
  priority: "High" | "Medium" | "Low";
}>;

const newReport = {
  id: `SORO-${Date.now()}`,
  title: data.title,
  location: data.location,
  status: "Pending" as const,
  date: new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }),
  priority: data.urgency as "High" | "Medium" | "Low",
};

localStorage.setItem(
  "soro-submitted-reports",
  JSON.stringify([newReport, ...savedReports])
);

    setMessage({
      type: "success",
      text: "Form is ready. Photo and data are prepared for backend integration.",
    });
    setTimeout(() => {
 router.push("/report-submitted")
}, 1500);
  } catch (error) {
    console.error(error);
    setMessage({
      type: "error",
      text: "Something went wrong while preparing the report. Please try again.",
    });
  }
}

  const fieldClass =
    "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <a href="/dashboard" className="text-sm text-blue-700 hover:underline">
          ← Back to dashboard
        </a>

        <h1 className="mt-5 text-3xl font-bold tracking-tight">
          Report an Incident
        </h1>
        <p className="mt-2 mb-6 text-slate-600">
          Provide clear details so the team can respond appropriately.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          noValidate
        >
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold">
              Incident title *
            </label>
            <input
              id="title"
              className={fieldClass}
              placeholder="Brief summary of the incident"
              {...register("title")}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Incident Type */}
          <div>
            <label htmlFor="incidentType" className="block text-sm font-semibold">
              Incident type *
            </label>
            <select
              id="incidentType"
              className={fieldClass}
              {...register("incidentType")}
            >
              <option value="">Choose a type</option>
              <option value="theft">Theft or missing property</option>
              <option value="suspicious_activity">Suspicious activity</option>
              <option value="harassment">Harassment</option>
              <option value="vandalism">Property damage / vandalism</option>
              <option value="safety_hazard">Safety hazard</option>
              <option value="medical_emergency">Medical emergency</option>
              <option value="fire">Fire or smoke</option>
              <option value="other">Other</option>
            </select>
            {errors.incidentType && (
              <p className="mt-1 text-sm text-red-600">
                {errors.incidentType.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-semibold">
              Location *
            </label>
            <input
              id="location"
              className={fieldClass}
              placeholder="e.g. Moremi Hall, Room 204 or near Senate Building"
              {...register("location")}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          {/* Urgency */}
          <div>
            <label htmlFor="urgency" className="block text-sm font-semibold">
              Urgency level
            </label>
            <select id="urgency" className={fieldClass} {...register("urgency")}>
              <option value="low">Low – not urgent</option>
              <option value="medium">Medium – needs attention soon</option>
              <option value="high">High – urgent</option>
              <option value="critical">Critical – immediate danger</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold">
              Description *
            </label>
            <textarea
              id="description"
              rows={5}
              className={fieldClass}
              placeholder="Explain what happened. Include useful details but avoid unnecessary personal information."
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

{/* Photo */}
<div>
  <label
    htmlFor="photo"
    className="block text-sm font-semibold"
  >
    Photo evidence (optional)
  </label>

  <label
    htmlFor="photo"
    className="mt-2 flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 px-4 py-8 text-center transition hover:border-blue-600 hover:bg-blue-100"
  >
    <span className="mb-3 text-3xl">📷</span>

    <span className="text-sm font-semibold text-blue-800">
      {selectedPhoto instanceof File
        ? "Photo selected successfully"
        : "Click here to upload a photo"}
    </span>

    <span className="mt-1 text-xs text-slate-600">
      {selectedPhoto instanceof File
        ? selectedPhoto.name
        : "Choose a JPEG, PNG or WebP image"}
    </span>

    <span className="mt-3 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">
      Choose Photo
    </span>
  </label>
{photoPreview && (
  <div className="mt-4">
    <p className="mb-2 text-sm font-semibold text-slate-700">
      Photo preview
    </p>

    <img
      src={photoPreview}
      alt="Selected photo preview"
      className="h-48 w-full rounded-xl border border-slate-200 object-contain"
    />
  </div>
)}
  <input
    key={photoInputKey}
    id="photo"
    type="file"
    accept="image/jpeg,image/png,image/webp"
    className="sr-only"
    onChange={(e) => {
      const file = e.target.files?.[0];

      if (!file) {
        setValue("photo", undefined);
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        setMessage({
          type: "error",
          text: "Only JPEG, PNG, or WebP images are allowed.",
        });
        setValue("photo", undefined);
        e.target.value = "";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setMessage({
          type: "error",
          text: "The image must be 5 MB or smaller.",
        });
        setValue("photo", undefined);
        e.target.value = "";
        return;
      }

     setMessage(null);
setPhotoPreview(URL.createObjectURL(file));
setValue("photo", file);
    }}
  />

  <p className="mt-1 text-xs text-slate-500">
    JPEG, PNG or WebP only. Maximum 5 MB. Secure upload will be connected when the backend is ready.
  </p>

  {selectedPhoto instanceof File && (
    <button
      type="button"
      onClick={() => {
        setValue("photo", undefined);
        setPhotoPreview(null);
        setPhotoInputKey((key) => key + 1);
        setMessage(null);
        setPhotoPreview(null);
      }}
      className="mt-2 text-sm text-red-600"
    >
      Remove selected photo
    </button>
  )}
</div>

        

          {/* Anonymous */}
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300"
              {...register("isAnonymous")}
            />
            <span className="text-sm">
              <strong>Submit anonymously</strong>
              <span className="block text-slate-600">
                Your identity will not be shown in normal student views. The
                backend must enforce this.
              </span>
            </span>
          </label>

          {/* Message */}
          {message && (
            <div
              role="status"
              className={`rounded-lg p-3 text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Validating..." : "Submit Report"}
          </button>

          <p className="text-xs text-slate-500">
            * Required fields. If you are in immediate danger, contact campus
            security or emergency services directly.
          </p>
        </form>
      </div>
    </main>
  );
}