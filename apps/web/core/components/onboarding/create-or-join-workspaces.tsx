import React from "react";
import { observer } from "mobx-react";
import { OctagonAlert } from "lucide-react";
// plane imports
import type { IWorkspaceMemberInvitation, TOnboardingSteps } from "@plane/types";
// hooks
import { useUser } from "@/hooks/store/user";
// local imports
import { Invitations } from "./invitations";
import { SwitchAccountDropdown } from "./switch-account-dropdown";

export enum ECreateOrJoinWorkspaceViews {
  WORKSPACE_CREATE = "WORKSPACE_CREATE",
  WORKSPACE_JOIN = "WORKSPACE_JOIN",
}

type Props = {
  invitations: IWorkspaceMemberInvitation[];
  totalSteps: number;
  stepChange: (steps: Partial<TOnboardingSteps>) => Promise<void>;
  finishOnboarding: () => Promise<void>;
};

export const CreateOrJoinWorkspaces = observer(function CreateOrJoinWorkspaces(props: Props) {
  const { invitations, finishOnboarding } = props;
  // store hooks
  const { data: user } = useUser();

  const handleNextStep = async () => {
    if (!user) return;

    await finishOnboarding();
  };

  return (
    <div className="flex h-full w-full">
      <div className="w-full h-full overflow-auto px-6 py-10 sm:px-7 sm:py-14 md:px-14 lg:px-28">
        <div className="flex flex-col w-full items-center justify-center p-8 mt-6">
          {invitations.length > 0 ? (
            <Invitations
              invitations={invitations}
              handleNextStep={handleNextStep}
              handleCurrentViewChange={() => {}}
            />
          ) : (
            <div className="flex h-96 w-full items-center justify-center">
              <div className="flex gap-2.5 w-full items-start justify-center text-sm leading-5 mt-4 px-6 py-4 rounded border border-custom-primary-100/20 bg-custom-primary-100/10 text-custom-primary-200">
                <OctagonAlert className="flex-shrink-0 size-5 mt-1" />
                <span>
                  You don&apos;t seem to have any invites to a workspace. Please ask a workspace owner or admin to invite you to a workspace first
                  and come back to this screen to join.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      <SwitchAccountDropdown />
    </div>
  );
});
