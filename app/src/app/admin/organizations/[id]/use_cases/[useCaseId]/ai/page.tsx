"use client";

import { PageTemplate } from "@/components/admin/page-template";
import { Button } from "@/components/ui/button";
import {
  deleteUseCaseTrainingMaterial,
  getUseCaseOpenAiTokenStatus,
  deleteUseCaseOpenAiToken,
  listUseCaseTrainingMaterials,
  type UseCaseTrainingMaterialListItem,
  setUseCaseOpenAiToken,
  uploadUseCaseTrainingMaterial,
} from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";

export default function AiPage() {
  const { id, useCaseId } = useParams<{ id: string; useCaseId: string }>();
  const queryClient = useQueryClient();

  const [tokenDraft, setTokenDraft] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const trainingMaterialsQueryKey = useMemo(
    () => ["use_case_training_materials", id, useCaseId],
    [id, useCaseId]
  );

  const tokenStatusQueryKey = useMemo(
    () => ["use_case_openai_token_status", id, useCaseId],
    [id, useCaseId]
  );

  const trainingMaterialsQuery = useQuery<UseCaseTrainingMaterialListItem[]>({
    queryKey: trainingMaterialsQueryKey,
    queryFn: () => listUseCaseTrainingMaterials(id, useCaseId),
    enabled: !!id && !!useCaseId,
  });

  const tokenStatusQuery = useQuery({
    queryKey: tokenStatusQueryKey,
    queryFn: () => getUseCaseOpenAiTokenStatus(id, useCaseId),
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

  const setTokenMutation = useMutation({
    mutationFn: () => setUseCaseOpenAiToken(id, useCaseId, tokenDraft),
    onSuccess: async () => {
      setTokenDraft("");
      await queryClient.invalidateQueries({ queryKey: tokenStatusQueryKey });
    },
  });

  const deleteTokenMutation = useMutation({
    mutationFn: () => deleteUseCaseOpenAiToken(id, useCaseId),
    onSuccess: async () => {
      setTokenDraft("");
      await queryClient.invalidateQueries({ queryKey: tokenStatusQueryKey });
    },
  });

  return (
    <PageTemplate title="Tekoäly">
      <div className="flex flex-col gap-6">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-gray-900">OpenAI token</h2>
          <p className="mt-2 text-sm text-gray-600">
            Tallenna OpenAI API key käyttötapaukselle. Avain tallennetaan salattuna,
            eikä sitä palauteta API:sta selväkielisenä.
          </p>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-700">
              Tila:{" "}
              {tokenStatusQuery.isLoading
                ? "Ladataan…"
                : tokenStatusQuery.data?.configured
                  ? `Asetettu (••••${tokenStatusQuery.data.last4 ?? ""})`
                  : "Ei asetettu"}
            </div>

            {tokenStatusQuery.data?.configured && (
              <Button
                size="sm"
                variant="destructive"
                isLoading={deleteTokenMutation.isPending}
                onClick={() => {
                  const ok = window.confirm(
                    "Poistetaanko OpenAI token tältä käyttötapaukselta?"
                  );
                  if (!ok) return;
                  deleteTokenMutation.mutate();
                }}
              >
                Poista
              </Button>
            )}
          </div>

          {!tokenStatusQuery.isLoading && !tokenStatusQuery.data?.configured && (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="password"
                value={tokenDraft}
                onChange={(e) => setTokenDraft(e.target.value)}
                placeholder="sk-…"
                className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm"
                autoComplete="off"
              />
              <Button
                size="sm"
                onClick={() => setTokenMutation.mutate()}
                disabled={setTokenMutation.isPending || tokenDraft.trim().length === 0}
              >
                Tallenna
              </Button>
            </div>
          )}

          {setTokenMutation.isError && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              Tallennus epäonnistui. Tarkista että `APP_SECRETS_KEY` on asetettu.
            </div>
          )}

          {deleteTokenMutation.isError && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              Tokenin poisto epäonnistui.
            </div>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-gray-900">Opetusmateriaalit</h2>
          <p className="mt-2 text-sm text-gray-600">
            Lataa käyttötapaukseen omia tekstitiedostoja (.txt / .md).
          </p>

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
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
            >
              Valitse tiedosto
            </Button>

            <div className="min-w-0 text-sm text-gray-700">
              {selectedFile ? (
                <span className="truncate">{selectedFile.name}</span>
              ) : (
                <span className="text-gray-500">Ei tiedostoa valittuna</span>
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
              Lataa
            </Button>
          </div>

          {uploadMutation.isError && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              Lataus epäonnistui.
            </div>
          )}

          <div className="mt-5 rounded-lg border border-gray-200">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="text-sm font-medium text-gray-900">Ladatut materiaalit</div>
              <div className="mt-1 text-xs text-gray-600">
                Näkyy tässä listana (MVP). Kytkentä chattiin voidaan tehdä seuraavaksi.
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {trainingMaterialsQuery.isLoading && (
                <div className="px-4 py-3 text-sm text-gray-600">Ladataan…</div>
              )}

              {trainingMaterialsQuery.isError && (
                <div className="px-4 py-3 text-sm text-red-700">
                  Materiaalien haku epäonnistui.
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
                        <div className="text-sm font-medium text-gray-900">
                          {m.filename}
                        </div>
                        <div className="mt-0.5 text-xs text-gray-600">
                          {m.mimeType} · {new Date(m.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="destructive"
                        isLoading={deleteMutation.isPending}
                        onClick={() => {
                          const ok = window.confirm(
                            `Poistetaanko opetusmateriaali "${m.filename}"?`
                          );
                          if (!ok) return;
                          deleteMutation.mutate(m.id);
                        }}
                      >
                        Poista
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-600">Ei ladattuja materiaaleja.</div>
                ))}
            </div>
          </div>

          {deleteMutation.isError && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              Poisto epäonnistui.
            </div>
          )}
        </section>
      </div>
    </PageTemplate>
  );
}
