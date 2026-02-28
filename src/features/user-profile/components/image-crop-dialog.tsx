"use client";

import { useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
}

export function ImageCropDialog({
  open,
  onOpenChange,
  imageSrc,
  onCropComplete,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropAreaChange = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    const canvas = document.createElement("canvas");
    const img = new Image();
    img.src = imageSrc;

    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
    });

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
      img,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
    );

    canvas.toBlob((blob) => {
      if (blob) {
        onCropComplete(blob);
        onOpenChange(false);
      }
    }, "image/jpeg");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>ครอบตัดรูปภาพ</DialogTitle>
        </DialogHeader>
        <div className="relative h-64 w-full">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropAreaChange}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Zoom:</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleSave}>บันทึก</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
