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
  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-4">
        <LoadingSpinner />
        Loading...
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
