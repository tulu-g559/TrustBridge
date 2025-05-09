import { cn } from '../../lib/utils';

function Skeleton(props) {
  const { className, ...rest } = props;

  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...rest}
    />
  );
}

export { Skeleton };
