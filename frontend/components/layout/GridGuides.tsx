const GUIDE_COLUMNS = 12

export function GridGuides() {
  return (
    <div className="guides" aria-hidden="true">
      <div className="cols">
        {Array.from({ length: GUIDE_COLUMNS }, (_, index) => (
          <div className="col" key={index + 1}>
            <span>{index + 1}</span>
          </div>
        ))}
      </div>
      <div className="rows" />
      <div className="mline l" />
      <div className="mline r" />
    </div>
  )
}
