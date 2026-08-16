function TableBusyOverlay({ message }) {
    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/15 bg-black/80 px-6 py-5 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/25 border-t-amber-300" />
                <p className="text-sm font-semibold tracking-wide text-white sm:text-base">
                    {message}
                </p>
            </div>
        </div>
    );
}

export default TableBusyOverlay;
