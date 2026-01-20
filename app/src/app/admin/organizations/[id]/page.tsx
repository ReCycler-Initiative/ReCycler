"use client";

import { PageTemplate } from "@/components/admin/page-template";

/**
 * Admin landing / welcome page
 */
const AdminHomePage = () => {
  return (
    <PageTemplate title="Tervetuloa">
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center pb-8">
        <section className="max-w-xl rounded-xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Tervetuloa 👋
          </h2>

          <p className="mt-4 text-gray-600">
            Tämä on hallintanäkymän etusivu.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Valitse toiminto yläreunan navigaatiosta.
          </p>
        </section>
      </div>
    </PageTemplate>
  );
};

export default AdminHomePage;
