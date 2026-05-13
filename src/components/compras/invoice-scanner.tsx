"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileImage, Scan, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { AI_ENABLED } from "@/lib/ai-config";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InvoiceScannerProps {
  onItemsExtracted: (items: { nombre: string; cantidad: number; precioUnitario: number }[]) => void;
}

export function InvoiceScanner({ onItemsExtracted }: InvoiceScannerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!AI_ENABLED) return null;

  const handleFile = useCallback((selectedFile: File) => {
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Solo se permiten archivos PDF, JPG o PNG");
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBase64(result);
      localStorage.setItem("invoice-pending", result);

      if (selectedFile.type.startsWith("image/")) {
        setPreview(result);
      } else {
        setPreview(null);
      }
    };
    reader.readAsDataURL(selectedFile);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const handleScan = async () => {
    if (!base64) return;

    setIsScanning(true);
    try {
      const res = await fetch("/api/invoice/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al escanear");
      }

      const data = await res.json();
      localStorage.setItem("invoice-items", JSON.stringify(data.items));
      toast.success(`${data.items.length} productos extraídos`);
      onItemsExtracted(data.items);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error al escanear la factura");
    } finally {
      setIsScanning(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setBase64(null);
    localStorage.removeItem("invoice-pending");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <Scan className="h-5 w-5 text-primary" />
          Escanear Factura con IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!file ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer ${
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-slate-300 hover:border-slate-400 bg-slate-50"
            }`}
          >
            <Upload className="h-10 w-10 text-slate-400" />
            <div className="text-center">
              <p className="font-semibold text-slate-700">Arrastra tu factura aquí</p>
              <p className="text-sm text-slate-500">PDF, JPG o PNG</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {preview && (
              <div className="flex justify-center">
                <img
                  src={preview}
                  alt="Vista previa de la factura"
                  className="max-h-48 rounded-lg border object-contain"
                />
              </div>
            )}
            {!preview && file.type === "application/pdf" && (
              <div className="flex items-center justify-center gap-2 p-4 bg-slate-50 rounded-lg border">
                <FileImage className="h-8 w-8 text-slate-400" />
                <span className="text-sm text-slate-600 font-medium">{file.name}</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                className="h-9"
              >
                <X className="mr-1 h-4 w-4" />
                Remover
              </Button>
              <Button
                onClick={handleScan}
                disabled={isScanning}
                className="px-6 h-10 font-bold uppercase tracking-widest text-xs shadow-lg"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Escaneando...
                  </>
                ) : (
                  <>
                    <Scan className="mr-2 h-4 w-4" />
                    Escanear con IA
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
