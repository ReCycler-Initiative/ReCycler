"use client";

import { PageTemplate } from "@/components/admin/page-template";
import { Button } from "@/components/ui/button";
import {
  getUseCaseOpenAiTokenStatus,
  listUseCaseTrainingMaterials,
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const trainingMaterialsQueryKey = useMemo(
    () => ["use_case_training_materials", id, useCaseId],
    [id, useCaseId]
  );

  const tokenStatusQueryKey = useMemo(
    () => ["use_case_openai_token_status", id, useCaseId],
    [id, useCaseId]
  );

  const trainingMaterialsQuery = useQuery({
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
    },
  });

  const setTokenMutation = useMutation({
    mutationFn: () => setUseCaseOpenAiToken(id, useCaseId, tokenDraft),
    onSuccess: async () => {
      setTokenDraft("");
      await queryClient.invalidateQueries({ queryKey: tokenStatusQueryKey });
    },
  });

  return (
    <PageTemplate title="Tekoäly">
      <div className="flex flex-col gap-6">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">
            Tämä on mockup-sivu käyttötapauksen tekoälytoiminnoille.
          </p>
          <ul className="mt-3 list-disc pl-5 text-sm text-gray-700">
            <li>Ehdotukset datayhteyksien mappauksiin</li>
            <li>Poikkeamien tunnistus ajohistoriasta</li>
            <li>Yhteenvedot ja selitteet virheistä</li>
          </ul>
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
              className="block w-full text-sm"
              disabled={uploadMutation.isPending}
            />
            <Button
              size="sm"
              onClick={() => {
                const file = fileInputRef.current?.files?.[0];
                if (!file) return;
                uploadMutation.mutate(file);
              }}
              disabled={uploadMutation.isPending}
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
                    <div key={m.id} className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{m.filename}</div>
                      <div className="mt-0.5 text-xs text-gray-600">
                        {m.mimeType} · {new Date(m.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-600">Ei ladattuja materiaaleja.</div>
                ))}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-gray-900">OpenAI token</h2>
          <p className="mt-2 text-sm text-gray-600">
            Tallenna OpenAI API key käyttötapaukselle. Avain tallennetaan salattuna,
            eikä sitä palauteta API:sta selväkielisenä.
          </p>

          <div className="mt-3 text-sm text-gray-700">
            Tila:{" "}
            {tokenStatusQuery.isLoading
              ? "Ladataan…"
              : tokenStatusQuery.data?.configured
                ? `Asetettu (••••${tokenStatusQuery.data.last4 ?? ""})`
                : "Ei asetettu"}
          </div>

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

          {setTokenMutation.isError && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              Tallennus epäonnistui. Tarkista että `APP_SECRETS_KEY` on asetettu.
            </div>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-gray-900">Seuraavaksi</h2>
          <p className="mt-2 text-sm text-gray-600">
            Kun tekoälypalvelu on määritelty, tähän voidaan lisätä oikeat
            syötteet, tulokset ja käyttöoikeusrajaukset.
          </p>
        </section>
      </div>
    </PageTemplate>
  );
}
