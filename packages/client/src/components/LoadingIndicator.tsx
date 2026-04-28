export function LoadingIndicator() {
  return (
    <div className="flex justify-center py-4">
      <div
        aria-hidden="true"
        className="h-6 w-6 animate-spin rounded-full border-2 border-medium-gray border-t-transparent"
      />
    </div>
  )
}
