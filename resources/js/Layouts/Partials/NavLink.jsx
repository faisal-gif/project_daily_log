import { Link, usePage } from "@inertiajs/react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const NavLink = forwardRef(
  ({ href, className, activeClassName, children, ...props }, ref) => {
    const { url } = usePage();

    const isActive = url === href || url.startsWith(href + "/");

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(className, isActive && activeClassName)}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

NavLink.displayName = "NavLink";

export { NavLink };
