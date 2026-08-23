"use client";

import { usePropertyForm } from "../hooks/usePropertyForm";

import { PropertyFields } from "./PropertyFields";

export function PropertyForm() {
  const {
    formData,
    errors,
    isSubmitting,
    submitError,
    setField,
    submit,
  } = usePropertyForm();

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    await submit();
  }

  return (
    <form onSubmit={handleSubmit}>
      <PropertyFields
        formData={formData}
        errors={errors}
        setField={setField}
      />

      {/* خطای Backend */}
      {submitError && (
        <div role="alert">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "در حال ثبت..."
          : "ثبت ملک"}
      </button>
    </form>
  );
}