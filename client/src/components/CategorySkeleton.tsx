export default function CategorySkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {/* Skeleton for "All Gear" button */}
      <div className="w-full h-12 bg-sand-200 rounded-full"></div>
      
      {/* Skeleton for category buttons */}
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="w-full h-12 bg-sand-200 rounded-full"></div>
      ))}
    </div>
  )
}