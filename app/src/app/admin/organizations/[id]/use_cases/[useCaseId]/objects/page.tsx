"use client";

import { PageIntro } from "@/components/admin/page-intro";
import { PageTemplate } from "@/components/admin/page-template";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/i18n/locale-provider";
import { Plus } from "lucide-react";

const ObjectsPage = () => {
  const messages = useMessages();

  return (
    <PageTemplate>
      <PageIntro
        title={messages.admin.fields}
        description={messages.admin.useCaseHomeHighlights[2]}
        actions={
          <Button onClick={() => undefined}>
            <Plus className="h-4 w-4 mr-2" />
            Lisää sisältömalli
          </Button>
        }
      />
    </PageTemplate>
  );
};

export default ObjectsPage;
