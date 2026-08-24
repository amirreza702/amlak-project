interface PropertyPageHeaderProps {
  title: string;
  description?: string;
}

export function PropertyPageHeader({
  title,
  description,
}: PropertyPageHeaderProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-primary">
        املاک
      </p>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </h1>

      {description && (
        <p className="text-sm text-muted-foreground sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}