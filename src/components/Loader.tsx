type LoaderProps = {
  className?: string;
};

export function Loader({ className = "" }: LoaderProps) {
  return (
    <div className={`loader ${className}`.trim()} aria-hidden="true">
      <div className="loader-popup">
        <div className="loader-body">
          <p className="loader-label">
            <span className="loader-text">loading</span>
            <span className="loader-dots">
              <span className="loader-dot">.</span>
              <span className="loader-dot">.</span>
              <span className="loader-dot">.</span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
