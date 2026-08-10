type LoaderProps = {
  className?: string;
};

export function Loader({ className = "" }: LoaderProps) {
  return (
    <div className={`loader ${className}`.trim()} aria-hidden="true">
      <div className="loader-card">
        <img className="loader-image" src="/assets/pinkcard.png" alt="" />
      </div>
    </div>
  );
}
