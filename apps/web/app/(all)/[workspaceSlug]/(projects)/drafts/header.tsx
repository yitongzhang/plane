import { observer } from "mobx-react";
import { EUserPermissions, EUserPermissionsLevel } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
// ui
import { DraftIcon } from "@plane/propel/icons";
import { Breadcrumbs, Header } from "@plane/ui";
// components
import { BreadcrumbLink } from "@/components/common/breadcrumb-link";
import { CountChip } from "@/components/common/count-chip";

// hooks
import { useProject } from "@/hooks/store/use-project";
import { useUserPermissions } from "@/hooks/store/user";
import { useWorkspaceDraftIssues } from "@/hooks/store/workspace-draft";

export const WorkspaceDraftHeader = observer(function WorkspaceDraftHeader() {
  // store hooks
  const { allowPermissions } = useUserPermissions();
  const { paginationInfo } = useWorkspaceDraftIssues();
  const { joinedProjectIds } = useProject();

  const { t } = useTranslation();
  // check if user is authorized to create draft work item
  const isAuthorizedUser = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.WORKSPACE
  );

  return (
    <>
      <Header>
        <Header.LeftItem>
          <div className="flex items-center gap-2.5">
            <Breadcrumbs>
              <Breadcrumbs.Item
                component={
                  <BreadcrumbLink label={t("drafts")} icon={<DraftIcon className="h-4 w-4 text-custom-text-300" />} />
                }
              />
            </Breadcrumbs>
            {paginationInfo?.total_count && paginationInfo?.total_count > 0 ? (
              <CountChip count={paginationInfo?.total_count} />
            ) : (
              <></>
            )}
          </div>
        </Header.LeftItem>

        <Header.RightItem>
          {/* Issue creation button removed */}
        </Header.RightItem>
      </Header>
    </>
  );
});
