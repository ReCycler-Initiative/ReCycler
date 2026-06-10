"use client";

import { PageTemplate } from "@/components/admin/page-template";
import { PageIntro } from "@/components/admin/page-intro";
import { Button } from "@/components/ui/button";
import { FileText, Files, HardDrive, Trash2, Upload } from "lucide-react";
import { useMessages } from "@/i18n/locale-provider";
import {
  deleteUseCaseTrainingMaterial,
  listUseCaseTrainingMaterials,
  type UseCaseTrainingMaterialListItem,
  uploadUseCaseTrainingMaterial,
} from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";

export default function AiPage() {
  const messages = useMessages();
  const { id, useCaseId } = useParams<{ id: string; useCaseId: string }>();
  const queryClient = useQueryClient();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const trainingMaterialsQueryKey = useMemo(
    () => ["use_case_training_materials", id, useCaseId],
    [id, useCaseId]
  );

  const trainingMaterialsQuery = useQuery<UseCaseTrainingMaterialListItem[]>({
    queryKey: trainingMaterialsQueryKey,
    queryFn: () => listUseCaseTrainingMaterials(id, useCaseId),
    enabled: !!id && !!useCaseId,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadUseCaseTrainingMaterial(id, useCaseId, file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: trainingMaterialsQueryKey });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedFile(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (materialId: string) =>
      deleteUseCaseTrainingMaterial(id, useCaseId, materialId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: trainingMaterialsQueryKey });
    },
  });

  return (
    <PageTemplate>
      <div className="flex flex-col gap-6">
        <PageIntro
          title={messages.adminAiPage.title}
          description={messages.adminAiPage.description}
        />
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-gray-900">{messages.adminAiPage.trainingMaterials}</h2>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <Files className="h-4 w-4 text-gray-600" />
                {messages.adminAiPage.trainingMaterials}
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">
                {trainingMaterialsQuery.isLoading
                  ? "…"
                  : (trainingMaterialsQuery.data?.length ?? 0)}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <FileText className="h-4 w-4 text-gray-600" />
                {messages.adminAiPage.allowedFormats}
              </div>
              <div className="mt-1 text-sm text-gray-700">.txt, .md</div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <HardDrive className="h-4 w-4 text-gray-600" />
                {messages.adminAiPage.maxSize}
              </div>
              <div className="mt-1 text-sm text-gray-700">512 KB / tiedosto</div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,text/plain,text/markdown"
              className="hidden"
              disabled={uploadMutation.isPending}
              onChange={() => {
                const file = fileInputRef.current?.files?.[0] ?? null;
                setSelectedFile(file);
              }}
            />

            <Button
              size="sm"
              variant="outline"
              className="ai-choose-file-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
            >
              <Upload className="mr-2 h-4 w-4" />
              {messages.adminAiPage.chooseFile}
            </Button>

            <div className="min-w-0 text-sm text-gray-700">
              {selectedFile ? (
                <span className="truncate">{selectedFile.name}</span>
              ) : (
                <span className="text-gray-500">{messages.adminAiPage.noFileSelected}</span>
              )}
            </div>

            <Button
              size="sm"
              onClick={() => {
                const file = fileInputRef.current?.files?.[0];
                if (!file) return;
                uploadMutation.mutate(file);
              }}
              disabled={uploadMutation.isPending || !selectedFile}
            >
              <Upload className="mr-2 h-4 w-4" />
              {messages.adminAiPage.upload}
            </Button>
          </div>

          {uploadMutation.isError && (
            <div className="ai-error-banner mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {messages.adminAiPage.uploadFailed}
            </div>
          )}

          <div className="mt-5 rounded-lg border border-gray-200">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="text-sm font-medium text-gray-900">
                {messages.adminAiPage.uploadedMaterials}
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {trainingMaterialsQuery.isLoading && (
                <div className="px-4 py-3 text-sm text-gray-600">{messages.adminAiPage.loading}</div>
              )}

              {trainingMaterialsQuery.isError && (
                <div className="ai-error-text px-4 py-3 text-sm text-red-700">
                  {messages.adminAiPage.fetchFailed}
                </div>
              )}

              {!trainingMaterialsQuery.isLoading &&
                !trainingMaterialsQuery.isError &&
                (trainingMaterialsQuery.data?.length ? (
                  trainingMaterialsQuery.data.map((m) => (
                    <div
                      key={m.id}
                      className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                          <FileText className="h-4 w-4 text-gray-600" />
                          <span className="truncate">{m.filename}</span>
                        </div>
                        <div className="mt-0.5 text-xs text-gray-600">
                          {m.mimeType} · {new Date(m.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="ai-delete-button"
                        isLoading={deleteMutation.isPending}
                        onClick={() => {
                          const ok = window.confirm(
                            messages.adminAiPage.confirmDelete.replace("{name}", m.filename)
                          );
                          if (!ok) return;
                          deleteMutation.mutate(m.id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {messages.adminAiPage.delete}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-600">{messages.adminAiPage.noUploadedMaterials}</div>
                ))}
            </div>
          </div>

          {deleteMutation.isError && (
            <div className="ai-error-banner mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {messages.adminAiPage.deleteFailed}
            </div>
          )}
        </section>
      </div>
    </PageTemplate>
  );
}
