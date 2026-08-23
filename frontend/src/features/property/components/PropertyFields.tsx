import type {
  PropertyFormData,
  PropertyFormErrors,
} from "../types/property";

interface PropertyFieldsProps {
  formData: PropertyFormData;

  errors: PropertyFormErrors;

  setField: (
    field: keyof PropertyFormData,
    value: string
  ) => void;
}

export function PropertyFields({
  formData,
  errors,
  setField,
}: PropertyFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="postalCode">
          کد پستی
        </label>

        <input
          id="postalCode"
          value={formData.postalCode}
          onChange={(e) =>
            setField(
              "postalCode",
              e.target.value
            )
          }
        />

        {errors.postalCode && (
          <p>{errors.postalCode}</p>
        )}
      </div>

      <div>
        <label htmlFor="area">
          متراژ
        </label>

        <input
          id="area"
          type="number"
          value={formData.area}
          onChange={(e) =>
            setField("area", e.target.value)
          }
        />

        {errors.area && (
          <p>{errors.area}</p>
        )}
      </div>

      <div>
        <label htmlFor="rooms">
          تعداد اتاق
        </label>

        <input
          id="rooms"
          type="number"
          value={formData.rooms}
          onChange={(e) =>
            setField(
              "rooms",
              e.target.value
            )
          }
        />

        {errors.rooms && (
          <p>{errors.rooms}</p>
        )}
      </div>

      <div>
        <label htmlFor="floor">
          طبقه
        </label>

        <input
          id="floor"
          type="number"
          value={formData.floor}
          onChange={(e) =>
            setField(
              "floor",
              e.target.value
            )
          }
        />

        {errors.floor && (
          <p>{errors.floor}</p>
        )}
      </div>
    </>
  );
}