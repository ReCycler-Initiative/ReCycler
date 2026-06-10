"use client";

import { createObject } from "@/services/api";
import { useRouter } from "next/navigation";
import { objectFormDefaultValues, toApiData } from "../_components/object-form";
import ObjectEditor from "../_components/object-editor";

export default function NewObjectPage() {
  const router = useRouter();

  return (
    <ObjectEditor
      defaultValues={objectFormDefaultValues}
      title="Uusi sisältömalli"
      introDescription="Luo uusi sisältömalli"
      mutation={async (organizationId, useCaseId, data) => {
        await createObject(organizationId, useCaseId, toApiData(data));
      }}
      onSuccess={(organizationId, useCaseId) =>
        router.push(
          `/admin/organizations/${organizationId}/use_cases/${useCaseId}/objects`
        )
      }
    />
  );
}
