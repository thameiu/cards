type LoaderProps = {
  className?: string;
};

export function Loader({ className = "" }: LoaderProps) {
  return (
    <div className={`loader ${className}`.trim()} aria-hidden="true">
      <div className="loader-popup">
        <div className="loader-body">
          <p className="loader-label">
            loading
            <span className="loader-dots">...</span>
          </p>
        </div>
      </div>
    </div>
  );
}
