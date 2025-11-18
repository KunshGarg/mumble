"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "./ImageUploader";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  description: string | null;
  dateTime: Date;
  location: string;
  latitude: number | null;
  longitude: number | null;
  basePrice: number;
  isPublished: boolean;
  discountTier1Quantity: number;
  discountTier1Percent: number;
  discountTier2Quantity: number;
  discountTier2Percent: number;
  createdAt: Date;
  updatedAt: Date;
}

interface EventImage {
  id: string;
  url: string;
  altText: string | null;
  eventId: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dateTime: z.string().min(1, "Date and time is required"),
  location: z.string().min(1, "Location is required"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  basePrice: z.string().min(1, "Base price is required"),
  isPublished: z.boolean(),
  discountTier1Quantity: z.string(),
  discountTier1Percent: z.string(),
  discountTier2Quantity: z.string(),
  discountTier2Percent: z.string(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventWithImages extends Event {
  images?: EventImage[];
}

interface EventFormProps {
  event?: EventWithImages;
  mode: "create" | "edit";
}

export function EventForm({ event, mode }: EventFormProps) {
  const router = useRouter();
  const [images, setImages] = useState<{ url: string; altText: string }[]>(
    event?.images?.map((img) => ({ url: img.url, altText: img.altText || "" })) || []
  );
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      dateTime: event?.dateTime
        ? new Date(event.dateTime).toISOString().slice(0, 16)
        : "",
      location: event?.location || "",
      latitude: event?.latitude?.toString() || "",
      longitude: event?.longitude?.toString() || "",
      basePrice: event?.basePrice?.toString() || "",
      isPublished: event?.isPublished || false,
      discountTier1Quantity: event?.discountTier1Quantity?.toString() || "2",
      discountTier1Percent: event?.discountTier1Percent?.toString() || "0",
      discountTier2Quantity: event?.discountTier2Quantity?.toString() || "4",
      discountTier2Percent: event?.discountTier2Percent?.toString() || "0",
    },
  });

  const isPublished = watch("isPublished");

  const onSubmit = async (data: EventFormData) => {
    setSubmitting(true);

    try {
      const endpoint =
        mode === "create"
          ? "/api/admin/events/create"
          : `/api/admin/events/${event?.id}`;

      const method = mode === "create" ? "POST" : "PUT";

      // For edit mode, only include new images
      const imagesToSend =
        mode === "create"
          ? images
          : images.filter(
              (img) => !event?.images?.some((eImg) => eImg.url === img.url)
            );

      const payload = {
        ...data,
        images: mode === "create" ? imagesToSend : undefined,
        newImages: mode === "edit" ? imagesToSend : undefined,
      };

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error || "Failed to save event");
      }

      toast.success(
        mode === "create"
          ? "Event created successfully!"
          : "Event updated successfully!"
      );

      router.push("/admin/events");
      router.refresh();
    } catch (error: any) {
      console.error("Error saving event:", error);
      toast.error(error.message || "Failed to save event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-900 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white mb-4">
          Basic Information
        </h2>

        <div>
          <Label htmlFor="title">Event Title *</Label>
          <Input
            id="title"
            {...register("title")}
            className="bg-gray-800 border-gray-700"
            placeholder="Enter event title"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            className="bg-gray-800 border-gray-700"
            placeholder="Enter event description"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dateTime">Date & Time *</Label>
            <Input
              id="dateTime"
              type="datetime-local"
              {...register("dateTime")}
              className="bg-gray-800 border-gray-700"
            />
            {errors.dateTime && (
              <p className="text-red-500 text-sm mt-1">
                {errors.dateTime.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              {...register("location")}
              className="bg-gray-800 border-gray-700"
              placeholder="Venue name or address"
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">
                {errors.location.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude">Latitude (optional)</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              {...register("latitude")}
              className="bg-gray-800 border-gray-700"
              placeholder="e.g. 30.346045"
            />
          </div>

          <div>
            <Label htmlFor="longitude">Longitude (optional)</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              {...register("longitude")}
              className="bg-gray-800 border-gray-700"
              placeholder="e.g. 76.378028"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-gray-900 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white mb-4">Pricing</h2>

        <div>
          <Label htmlFor="basePrice">Base Price (₹) *</Label>
          <Input
            id="basePrice"
            type="number"
            step="0.01"
            {...register("basePrice")}
            className="bg-gray-800 border-gray-700"
            placeholder="Enter base price"
          />
          {errors.basePrice && (
            <p className="text-red-500 text-sm mt-1">
              {errors.basePrice.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="discountTier1Quantity">
              Tier 1 Min Quantity
            </Label>
            <Input
              id="discountTier1Quantity"
              type="number"
              {...register("discountTier1Quantity")}
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div>
            <Label htmlFor="discountTier1Percent">Tier 1 Discount (%)</Label>
            <Input
              id="discountTier1Percent"
              type="number"
              step="0.01"
              {...register("discountTier1Percent")}
              className="bg-gray-800 border-gray-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="discountTier2Quantity">
              Tier 2 Min Quantity
            </Label>
            <Input
              id="discountTier2Quantity"
              type="number"
              {...register("discountTier2Quantity")}
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div>
            <Label htmlFor="discountTier2Percent">Tier 2 Discount (%)</Label>
            <Input
              id="discountTier2Percent"
              type="number"
              step="0.01"
              {...register("discountTier2Percent")}
              className="bg-gray-800 border-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-gray-900 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white mb-4">Event Images *</h2>
        <ImageUploader images={images} onImagesChange={setImages} />
      </div>

      {/* Publishing */}
      <div className="bg-gray-900 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="isPublished" className="text-lg">
              Publish Event
            </Label>
            <p className="text-sm text-gray-400 mt-1">
              Make this event visible to the public
            </p>
          </div>
          <Switch
            id="isPublished"
            checked={isPublished}
            onCheckedChange={(checked) => setValue("isPublished", checked)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        <Button
          type="submit"
          disabled={submitting}
          className="bg-purple-700 hover:bg-purple-600"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : mode === "create" ? (
            "Create Event"
          ) : (
            "Update Event"
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
