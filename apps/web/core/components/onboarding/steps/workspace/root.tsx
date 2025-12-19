import React from "react";
import { observer } from "mobx-react";
// plane imports
import type { IWorkspaceMemberInvitation } from "@plane/types";
import { EOnboardingSteps } from "@plane/types";
// local components
import { WorkspaceJoinInvitesStep } from "./";

type Props = {
  invitations: IWorkspaceMemberInvitation[];
  handleStepChange: (step: EOnboardingSteps, skipInvites?: boolean) => void;
};

export const WorkspaceSetupStep = observer(function WorkspaceSetupStep({ invitations, handleStepChange }: Props) {
  return (
    <WorkspaceJoinInvitesStep
      invitations={invitations}
      handleNextStep={async () => {
        handleStepChange(EOnboardingSteps.WORKSPACE_CREATE_OR_JOIN, true);
      }}
      handleCurrentViewChange={() => {}}
    />
  );
});
