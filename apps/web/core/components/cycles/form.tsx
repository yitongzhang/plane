import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
// plane imports
import { ETabIndices } from "@plane/constants";
// types
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import type { CycleDateCheckData, ICycle } from "@plane/types";
// ui
import { Input, TextArea } from "@plane/ui";
import { cn, getDate, renderFormattedPayloadDate, getTabIndex } from "@plane/utils";
// components
import { DateRangeDropdown } from "@/components/dropdowns/date-range";
import { ProjectDropdown } from "@/components/dropdowns/project/dropdown";
// hooks
import { useUser } from "@/hooks/store/user/user-user";
// services
import { CycleService } from "@/services/cycle.service";

// services
const cycleService = new CycleService();

type Props = {
  handleFormSubmit: (values: Partial<ICycle>) => Promise<void>;
  handleClose: () => void;
  status: boolean;
  projectId: string;
  setActiveProject: (projectId: string) => void;
  data?: ICycle | null;
  isMobile?: boolean;
  workspaceSlug: string;
};

type DateValidationState = {
  isValidating: boolean;
  isValid: boolean | null;
  errorMessage: string | null;
};

const defaultValues: Partial<ICycle> = {
  name: "",
  description: "",
  start_date: null,
  end_date: null,
};

export function CycleForm(props: Props) {
  const { handleFormSubmit, handleClose, status, projectId, setActiveProject, data, isMobile = false, workspaceSlug } = props;
  // plane hooks
  const { t } = useTranslation();
  // store hooks
  const { projectsWithCreatePermissions } = useUser();
  // date validation state
  const [dateValidation, setDateValidation] = useState<DateValidationState>({
    isValidating: false,
    isValid: null,
    errorMessage: null,
  });
  // form data
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    control,
    reset,
    watch,
  } = useForm<ICycle>({
    defaultValues: {
      project_id: projectId,
      name: data?.name || "",
      description: data?.description || "",
      start_date: data?.start_date || null,
      end_date: data?.end_date || null,
    },
  });

  // Watch form values for real-time validation
  // eslint-disable-next-line react-hooks/incompatible-library
  const watchStartDate = watch("start_date");
  // eslint-disable-next-line react-hooks/incompatible-library
  const watchEndDate = watch("end_date");
  // eslint-disable-next-line react-hooks/incompatible-library
  const watchProjectId = watch("project_id");

  const { getIndex } = getTabIndex(ETabIndices.PROJECT_CYCLE, isMobile);

  // Date validation function
  const validateDates = useCallback(
    async (startDate: string | null, endDate: string | null, currentProjectId: string) => {
      // Reset validation if dates are incomplete
      if (!startDate || !endDate) {
        setDateValidation({
          isValidating: false,
          isValid: null,
          errorMessage: null,
        });
        return;
      }

      // Start validation
      setDateValidation({
        isValidating: true,
        isValid: null,
        errorMessage: null,
      });

      try {
        const payload: CycleDateCheckData = {
          start_date: renderFormattedPayloadDate(startDate) ?? startDate,
          end_date: renderFormattedPayloadDate(endDate) ?? endDate,
        };

        // Include cycle_id if editing an existing cycle
        if (data?.id) {
          payload.cycle_id = data.id;
        }

        const response = (await cycleService.cycleDateCheck(workspaceSlug, currentProjectId, payload)) as {
          status: boolean;
        };

        if (response.status) {
          setDateValidation({
            isValidating: false,
            isValid: true,
            errorMessage: null,
          });
        } else {
          setDateValidation({
            isValidating: false,
            isValid: false,
            errorMessage: "Selected dates overlap with an existing cycle. Choose different dates or create a draft cycle without dates.",
          });
        }
      } catch {
        setDateValidation({
          isValidating: false,
          isValid: null,
          errorMessage: null,
        });
      }
    },
    [data?.id, workspaceSlug]
  );

  // Validate dates when they change
  useEffect(() => {
    const currentProject = watchProjectId ?? projectId;
    if (currentProject && watchStartDate && watchEndDate) {
      const timeoutId = setTimeout(() => {
        void validateDates(watchStartDate, watchEndDate, currentProject);
      }, 300); // Debounce validation
      return () => clearTimeout(timeoutId);
    } else {
      setDateValidation({
        isValidating: false,
        isValid: null,
        errorMessage: null,
      });
    }
    return undefined;
  }, [watchStartDate, watchEndDate, watchProjectId, projectId, validateDates]);

  useEffect(() => {
    reset({
      ...defaultValues,
      ...data,
    });
  }, [data, reset]);

  // Determine if form can be submitted
  const canSubmit = !isSubmitting && !dateValidation.isValidating && dateValidation.isValid !== false;

  return (
    <form onSubmit={handleSubmit((formData) => handleFormSubmit(formData))}>
      <div className="space-y-5 p-5">
        <div className="flex items-center gap-x-3">
          {!status && (
            <Controller
              control={control}
              name="project_id"
              render={({ field: { value, onChange } }) => (
                <div className="h-7">
                  <ProjectDropdown
                    value={value}
                    onChange={(val) => {
                      if (!Array.isArray(val)) {
                        onChange(val);
                        setActiveProject(val);
                      }
                    }}
                    multiple={false}
                    buttonVariant="border-with-text"
                    renderCondition={(projectId) => !!projectsWithCreatePermissions?.[projectId]}
                    tabIndex={getIndex("cover_image")}
                  />
                </div>
              )}
            />
          )}
          <h3 className="text-xl font-medium text-custom-text-200">
            {status ? t("project_cycles.update_cycle") : t("project_cycles.create_cycle")}
          </h3>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <Controller
              name="name"
              control={control}
              rules={{
                required: t("title_is_required"),
                maxLength: {
                  value: 255,
                  message: t("title_should_be_less_than_255_characters"),
                },
              }}
              render={({ field: { value, onChange } }) => (
                <Input
                  name="name"
                  type="text"
                  placeholder={t("title")}
                  className="w-full text-base"
                  value={value}
                  inputSize="md"
                  onChange={onChange}
                  hasError={Boolean(errors?.name)}
                  tabIndex={getIndex("description")}
                  autoFocus
                />
              )}
            />
            <span className="text-xs text-red-500">{errors?.name?.message}</span>
          </div>
          <div>
            <Controller
              name="description"
              control={control}
              render={({ field: { value, onChange } }) => (
                <TextArea
                  name="description"
                  placeholder={t("description")}
                  className="w-full text-base resize-none min-h-24"
                  hasError={Boolean(errors?.description)}
                  value={value}
                  onChange={onChange}
                  tabIndex={getIndex("description")}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Controller
                control={control}
                name="start_date"
                render={({ field: { value: startDateValue, onChange: onChangeStartDate } }) => (
                  <Controller
                    control={control}
                    name="end_date"
                    render={({ field: { value: endDateValue, onChange: onChangeEndDate } }) => (
                      <div className="flex items-center gap-2">
                        <DateRangeDropdown
                          buttonVariant="border-with-text"
                          className={cn(
                            "h-7",
                            dateValidation.isValid === false && "border-red-500"
                          )}
                          minDate={new Date()}
                          value={{
                            from: getDate(startDateValue),
                            to: getDate(endDateValue),
                          }}
                          onSelect={(val) => {
                            onChangeStartDate(val?.from ? renderFormattedPayloadDate(val.from) : null);
                            onChangeEndDate(val?.to ? renderFormattedPayloadDate(val.to) : null);
                          }}
                          placeholder={{
                            from: "Start date",
                            to: "End date",
                          }}
                          hideIcon={{
                            to: true,
                          }}
                          tabIndex={getIndex("date_range")}
                          isClearable
                        />
                        {/* Date validation status indicator */}
                        {dateValidation.isValidating && (
                          <Loader2 className="h-4 w-4 animate-spin text-custom-text-300" />
                        )}
                        {!dateValidation.isValidating && dateValidation.isValid === true && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        {!dateValidation.isValidating && dateValidation.isValid === false && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    )}
                  />
                )}
              />
            </div>
            {/* Date validation error message */}
            {dateValidation.errorMessage && (
              <div className="flex items-start gap-2 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-500">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{dateValidation.errorMessage}</span>
              </div>
            )}
            {/* Helpful hint for dates */}
            {!watchStartDate && !watchEndDate && (
              <p className="text-xs text-custom-text-400">
                Dates are optional. Cycles without dates are saved as drafts.
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="px-5 py-4 flex items-center justify-end gap-2 border-t-[0.5px] border-custom-border-200">
        <Button variant="neutral-primary" size="sm" onClick={handleClose} tabIndex={getIndex("cancel")}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="primary"
          size="sm"
          type="submit"
          loading={isSubmitting}
          disabled={!canSubmit}
          tabIndex={getIndex("submit")}
        >
          {data
            ? isSubmitting
              ? t("common.updating")
              : t("project_cycles.update_cycle")
            : isSubmitting
              ? t("common.creating")
              : t("project_cycles.create_cycle")}
        </Button>
      </div>
    </form>
  );
}
