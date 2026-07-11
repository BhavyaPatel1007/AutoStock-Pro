export default function Loading({ fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full" />
      <p className="text-sm text-gray-400">Loading...</p>
    </div>
  );

  if (fullScreen) {
    return <div className="fixed inset-0 flex items-center justify-center bg-gray-50/80">{content}</div>;
  }

  return <div className="flex items-center justify-center py-12">{content}</div>;
}
