export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-navy-900 border-t-transparent" />
        <p className="mt-4 text-gray-500">Loading...</p>
      </div>
    </div>
  )
}
