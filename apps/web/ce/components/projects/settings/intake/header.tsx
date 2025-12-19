import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { RefreshCcw } from "lucide-react";
// ui
import { useTranslation } from "@plane/i18n";
import { Breadcrumbs, Header } from "@plane/ui";
// components
import { BreadcrumbLink } from "@/components/common/breadcrumb-link";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useProjectInbox } from "@/hooks/store/use-project-inbox";
// plane web imports
import { CommonProjectBreadcrumbs } from "@/plane-web/components/breadcrumbs/common";
import { IntakeIcon } from "@plane/propel/icons";

export const ProjectInboxHeader = observer(function ProjectInboxHeader() {
  // router
  const { workspaceSlug, projectId } = useParams();
  // store hooks
  const { t } = useTranslation();

  const { loader: currentProjectDetailsLoader } = useProject();
  const { loader } = useProjectInbox();

  return (
    <Header>
      <Header.LeftItem>
        <div className="flex items-center gap-4 flex-grow">
          <Breadcrumbs isLoading={currentProjectDetailsLoader === "init-loader"}>
            <CommonProjectBreadcrumbs workspaceSlug={workspaceSlug?.toString()} projectId={projectId?.toString()} />
            <Breadcrumbs.Item
              component={
                <BreadcrumbLink
                  label="Intake"
                  href={`/${workspaceSlug}/projects/${projectId}/intake/`}
                  icon={<IntakeIcon className="h-4 w-4 text-custom-text-300" />}
                  isLast
                />
              }
              isLast
            />
          </Breadcrumbs>

          {loader === "pagination-loading" && (
            <div className="flex items-center gap-1.5 text-custom-text-300">
              <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
              <p className="text-sm">{t("syncing")}...</p>
            </div>
          )}
        </div>
      </Header.LeftItem>
      <Header.RightItem />
    </Header>
  );
});
