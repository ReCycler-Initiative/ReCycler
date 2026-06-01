import { useMessages } from "@/i18n/locale-provider";

import LoadingSpinner from "./loading-spinner";

export const LoadingState = ({
  children,
  isLoading,
  error,
}: {
  children: React.ReactNode;
  isLoading: boolean;
  error: boolean;
}) => {
  const messages = useMessages();

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-4">
        <LoadingSpinner />
        {messages.pageLoading.loading}
      </div>
    );
  if (error)
    return (
      <p className="text-destructive">
        Something went wrong. Please try again later.
      </p>
    );

  return <>{children}</>;
};
