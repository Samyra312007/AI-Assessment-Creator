'use client';

export default function TopNav({ title }: { title?: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-3" style={{ borderRadius: '16px' }}>
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold text-[#a9a9a9]">Assignment</span>
        {title && (
          <>
            <span className="text-[#a9a9a9]">/</span>
            <span className="text-base font-semibold text-[#2f2f2f]">{title}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#f6f6f6]" />
        <span className="text-base font-semibold text-[#2f2f2f]">John Doe</span>
      </div>
    </div>
  );
}
