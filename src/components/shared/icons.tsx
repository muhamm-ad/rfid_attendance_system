// @/components/shared/icons.tsx

import React, { useMemo, startTransition } from "react";
import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";
import Image from "next/image";

// Lucide icon map
const lucideIconMap: Record<string, React.ComponentType<LucideProps>> = {
  clock: LucideIcons.Clock,
  checkcircle: LucideIcons.CheckCircle,
  bookopen: LucideIcons.BookOpen,
  layers: LucideIcons.Layers,
  users: LucideIcons.Users,
  lightbulb: LucideIcons.Lightbulb,
  shield: LucideIcons.Shield,
  zap: LucideIcons.Zap,
  briefcase: LucideIcons.Briefcase,
  cloud: LucideIcons.Cloud,
  microscope: LucideIcons.Microscope,
  graduationcap: LucideIcons.GraduationCap,
  bookopentext: LucideIcons.BookOpenText,
  shieldcheck: LucideIcons.ShieldCheck,
  school: LucideIcons.School,
  award: LucideIcons.Award,
  goal: LucideIcons.Goal,
  university: LucideIcons.University,
  mappin: LucideIcons.MapPin,
  github: LucideIcons.Github,
  linkedin: LucideIcons.Linkedin,
  mail: LucideIcons.Mail,
  facebook: LucideIcons.Facebook,
  twitter: LucideIcons.Twitter,
  instagram: LucideIcons.Instagram,
  youtube: LucideIcons.Youtube,
  calendarcheck2: LucideIcons.CalendarCheck2,
  servercog: LucideIcons.ServerCog,
  code: LucideIcons.Code,
  container: LucideIcons.Container,
  gitbranch: LucideIcons.GitBranch,
  workflow: LucideIcons.Workflow,
  binoculars: LucideIcons.Binoculars,
  cpu: LucideIcons.Cpu,
  circuitboard: LucideIcons.CircuitBoard,
  monitorcog: LucideIcons.MonitorCog,
  database: LucideIcons.Database,
  testtubediagonal: LucideIcons.TestTubeDiagonal,
  bugplay: LucideIcons.BugPlay,
  monitorpause: LucideIcons.MonitorPause,
  badgeplus: LucideIcons.BadgePlus,
  settings: LucideIcons.Settings,
  calcom: LucideIcons.CalendarCheck2,
  "external-link": LucideIcons.ExternalLink,
  chevronright: LucideIcons.ChevronRight,
  building2: LucideIcons.Building2,
  checkcircle2: LucideIcons.CheckCircle2,
  trophy: LucideIcons.Trophy,
  calendar: LucideIcons.Calendar,
  phone: LucideIcons.Phone,
  globe: LucideIcons.Globe,
  download: LucideIcons.Download,
  arrowdown: LucideIcons.ArrowDown,
  arrowright: LucideIcons.ArrowRight,
  chevrondown: LucideIcons.ChevronDown,
  chevronleft: LucideIcons.ChevronLeft,
  chevronup: LucideIcons.ChevronUp,
  menu: LucideIcons.Menu,
  x: LucideIcons.X,
  sun: LucideIcons.Sun,
  moon: LucideIcons.Moon,
  send: LucideIcons.Send,
  user: LucideIcons.User,
  quote: LucideIcons.Quote,
  alerttriangle: LucideIcons.AlertTriangle,
  refreshcw: LucideIcons.RefreshCw,
  home: LucideIcons.Home,
  construction: LucideIcons.Construction,
  wrench: LucideIcons.Wrench,
  loader2: LucideIcons.Loader2,
  circlecheck: LucideIcons.CircleCheck,
  info: LucideIcons.Info,
  octagonx: LucideIcons.OctagonX,
  trianglealert: LucideIcons.TriangleAlert,
  search: LucideIcons.Search,
  filequestion: LucideIcons.FileQuestion,
  bug: LucideIcons.Bug,
  blog: LucideIcons.FileText,
  hand: LucideIcons.Hand,
};

// Global cache for loaded icons to prevent re-loading
const iconCache = new Map<string, string | null>();

/**
 * Load icon path with caching
 * Returns a promise but doesn't block rendering
 */
export async function loadIcon(iconName: string): Promise<string> {
  if (!iconName) return "";

  const normalizedName = iconName.toLowerCase();

  // Check cache first
  if (iconCache.has(normalizedName)) {
    return iconCache.get(normalizedName) || "";
  }

  const extensions = [".svg", ".png", ".jpg", ".jpeg", ".webp"];

  for (const ext of extensions) {
    try {
      const iconModule = await import(
        `@/lib/assets/icons/${normalizedName}${ext}`
      );
      const path = iconModule.default || iconModule;
      iconCache.set(normalizedName, path);
      return path;
    } catch (error) {
      continue;
    }
  }

  // Try default icon
  try {
    const defaultModule = await import(`@/lib/assets/icons/default.svg`);
    const path = defaultModule.default || defaultModule;
    iconCache.set(normalizedName, path);
    return path;
  } catch {
    iconCache.set(normalizedName, null);
    return "";
  }
}

/**
 * Icon component that ONLY uses Lucide icons (no blocking)
 * For custom icons, use the utility functions separately
 *
 * @example
 * <Icon name="github" size={32} />
 */
export const Icon = React.memo<{
  name: string;
  size?: number;
  className?: string;
}>(({ name, size = 24, className = "" }) => {
  const normalizedName = useMemo(() => name.toLowerCase(), [name]);

  // Only use Lucide icons - instant, no blocking
  const LucideIcon = useMemo(
    () => lucideIconMap[normalizedName],
    [normalizedName]
  );

  if (LucideIcon) {
    return <LucideIcon size={size} className={className} />;
  }

  // Return null for non-Lucide icons
  return null;
});

Icon.displayName = "Icon";

/**
 * Icon component with asset fallback (optimized with caching)
 * Use this when you need custom asset icons
 *
 * @example
 * <IconWithFallback name="react" size={32} />
 */
export const IconWithFallback = React.memo<{
  name: string;
  size?: number;
  className?: string;
}>(({ name, size = 24, className = "" }) => {
  const normalizedName = useMemo(() => name.toLowerCase(), [name]);
  const [assetPath, setAssetPath] = React.useState<string | null>(() => {
    // Check cache immediately on mount
    return iconCache.get(normalizedName) || null;
  });

  // Check Lucide first
  const LucideIcon = useMemo(
    () => lucideIconMap[normalizedName],
    [normalizedName]
  );

  if (LucideIcon) {
    return <LucideIcon size={size} className={className} />;
  }

  // Load asset icon if not in cache
  React.useEffect(() => {
    // If already cached, skip loading
    if (assetPath) return;

    let cancelled = false;

    // Use startTransition for non-urgent updates
    startTransition(() => {
      loadIcon(normalizedName)
        .then((path) => {
          if (!cancelled && path) {
            setAssetPath(path);
          }
        })
        .catch(() => {
          // Silently fail
        });
    });

    return () => {
      cancelled = true;
    };
  }, [normalizedName, assetPath]);

  // Show asset icon if loaded
  if (assetPath) {
    return (
      <Image
        src={assetPath}
        alt={name}
        title={name}
        width={size}
        height={size}
        className={className}
        style={{ width: size, height: size }}
      />
    );
  }

  // Show placeholder while loading or if not found
  return null;
});

IconWithFallback.displayName = "IconWithFallback";

/**
 * Hook to preload icons (optimized with batching and caching)
 *
 * @example
 * const iconMap = useIconLoader(['react', 'docker', 'python']);
 */
export function useIconLoader(iconNames: string[]) {
  // Memoize normalized icon names
  const normalizedNames = useMemo(
    () => iconNames.map((name) => name.toLowerCase()),
    [iconNames]
  );

  // Filter out Lucide icons and already cached icons
  const iconsToLoad = useMemo(
    () =>
      normalizedNames.filter((name) => {
        // Skip Lucide icons
        if (lucideIconMap[name]) return false;
        // Skip if already cached (successfully loaded)
        if (iconCache.has(name) && iconCache.get(name)) return false;
        // Load if not cached or cache indicates failure (null)
        return true;
      }),
    [normalizedNames]
  );

  const [iconMap, setIconMap] = React.useState<Record<string, string>>(() => {
    // Initialize with cached icons
    const initial: Record<string, string> = {};
    normalizedNames.forEach((name) => {
      const cached = iconCache.get(name);
      if (cached) {
        initial[name] = cached;
      }
    });
    return initial;
  });

  React.useEffect(() => {
    if (iconsToLoad.length === 0) return;

    let cancelled = false;
    const batchSize = 5; // Load icons in batches
    const loadedIcons: Record<string, string> = { ...iconMap };
    let currentIndex = 0;

    const loadBatch = async () => {
      if (cancelled || currentIndex >= iconsToLoad.length) return;

      // Get current batch
      const batch = iconsToLoad.slice(currentIndex, currentIndex + batchSize);
      currentIndex += batchSize;

      // Process current batch
      const promises = batch.map(async (iconName) => {
        if (cancelled) return;
        try {
          const iconPath = await loadIcon(iconName);
          if (iconPath && !cancelled) {
            loadedIcons[iconName] = iconPath;
          }
        } catch (error) {
          // Continue on error
        }
      });

      await Promise.all(promises);

      // Batch update state to reduce re-renders
      if (!cancelled) {
        startTransition(() => {
          setIconMap((prev) => ({ ...prev, ...loadedIcons }));
        });
      }

      // Process next batch if available
      if (currentIndex < iconsToLoad.length && !cancelled) {
        // Use requestAnimationFrame for smoother loading
        requestAnimationFrame(() => {
          loadBatch();
        });
      }
    };

    // Start loading first batch
    loadBatch();

    return () => {
      cancelled = true;
    };
  }, [iconsToLoad.join(",")]); // Re-run when icon list changes

  return iconMap;
}

/**
 * Check if an icon exists in Lucide map
 */
export function isLucideIcon(iconName: string): boolean {
  return !!lucideIconMap[iconName.toLowerCase()];
}