export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full border-4 border-[#E5E5E5] border-t-[#C6A87C] animate-spin" />
                <p className="text-[#8C847F] text-sm animate-pulse">Loading...</p>
            </div>
        </div>
    )
}
