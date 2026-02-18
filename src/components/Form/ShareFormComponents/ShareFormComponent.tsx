"use client";
import { useState } from "react";
import ShareFormErrorComponent from "./ShareFormErrorComponent";
import Spinner from "@/components/Layout/Spinner";
import { AsyncReturnType } from "@/lib/database/types";
import { Form } from "@/lib/manage/form";
import { Id } from "@/lib/manage/types";
import toast, { Toaster } from "react-hot-toast";
import { SearchableSelect } from "@/components/General/SearchableSelect";

interface propsData {
  viewState: AsyncReturnType<typeof Form.getFormViewState>;
}

const ShareFormComponent = (props: propsData) => {
  const [showError, setShowError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(
    props.viewState.fields.map((x) => {
      return { k: x.id, v: "" };
    })
  );

  const submitForm = async () => {
    setIsSubmitting(true);
    let empty = false;
    for (const field of formData) {
      if (field.v.trim() === "") {
        empty = true;
        break;
      }
    }
    setShowError(empty);
    if (!empty) {
      await fetch("/api/form/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          form: props.viewState.id,
          fields: formData,
        }),
      });
      setFormData(
        props.viewState.fields.map((x) => {
          return { k: x.id, v: "" };
        })
      );
      toast.success("Successfully Submitted");
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
      toast.error("Fill all the required details!")
    }
  };

  const handleValueChange = (field: Id<"FormField">, value: string) => {
    setFormData(
      formData.map((x) => {
        if (x.k === field) {
          return { k: x.k, v: value };
        }
        return x;
      })
    );
  };

  return (
    <div className="bg-gray-100 flex justify-center items-center py-6 px-4">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-semibold text-gray-900">
          {props.viewState.title}
        </h1>
        {/* {showError && (
          <ShareFormErrorComponent message="Please fill in all required fields" />
        )} */}
        <form id="form" noValidate className="space-y-6">
          {props.viewState.fields.map((field) => {
            if (field.fkeys) {
              return (
                <div key={field.id}>
                  <label className="block text-base font-medium text-gray-700">
                    {field.display}
                  </label>
                  <SearchableSelect
                    className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    contentStyleOverride={{ width: "unset" }}
                    options={field.fkeys.map((x) => ({
                      display: x.display,
                      value: x.id,
                    }))}
                    onValueChanged={(value) =>
                      handleValueChange(field.id, `${value}`)
                    }
                  />
                </div>
              );
            }

            switch (field.type.type) {
              case "int":
                return (
                  <div key={field.id}>
                    <label
                      className="block text-base font-medium text-gray-700"
                      htmlFor={`field-${field.id}`}
                    >
                      {field.display}
                    </label>
                    <input
                      type="number"
                      min={field.type.min}
                      max={field.type.max}
                      id={`field-${field.id}`}
                      required
                      value={formData.find((x) => x.k === field.id)?.v}
                      onChange={(e) =>
                        handleValueChange(field.id, e.target.value)
                      }
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                );
              case "string":
                return (
                  <div key={field.id}>
                    <label className="block text-base font-medium text-gray-700">
                      {field.display}
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.find((x) => x.k === field.id)?.v}
                      onChange={(e) =>
                        handleValueChange(field.id, e.target.value)
                      }
                    />
                  </div>
                );
              case "float":
                return (
                  <div key={field.id}>
                    <label className="block text-base font-medium text-gray-700">
                      {field.display}
                    </label>
                    <input
                      type="number"
                      step="any"
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.find((x) => x.k === field.id)?.v}
                      onChange={(e) =>
                        handleValueChange(field.id, e.target.value)
                      }
                    />
                  </div>
                );
              case "timestamp":
                return (
                  <div key={field.id}>
                    <label className="block text-base font-medium text-gray-700">
                      {field.display}
                    </label>
                    <input
                      type="datetime-local"
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.find((x) => x.k === field.id)?.v}
                      onChange={(e) =>
                        handleValueChange(field.id, e.target.value)
                      }
                    />
                  </div>
                );
              case "date":
                return (
                  <div key={field.id}>
                    <label className="block text-base font-medium text-gray-700">
                      {field.display}
                    </label>
                    <input
                      type="date"
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.find((x) => x.k === field.id)?.v}
                      onChange={(e) =>
                        handleValueChange(field.id, e.target.value)
                      }
                    />
                  </div>
                );
              case "bool":
                return (
                  <div key={field.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={
                        formData.find((x) => x.k === field.id)?.v === "true"
                      }
                      onChange={(e) =>
                        handleValueChange(
                          field.id,
                          e.target.checked ? "true" : "false"
                        )
                      }
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label className="ml-3 text-base font-medium text-gray-700">
                      {field.display}
                    </label>
                  </div>
                );
              case "enum":
                return (
                  <div key={field.id}>
                    <label className="block text-base font-medium text-gray-700">
                      {field.display}
                    </label>
                    <select
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.find((x) => x.k === field.id)?.v}
                      onChange={(e) =>
                        handleValueChange(field.id, e.target.value)
                      }
                    >
                      {field.type.values.map((val) => (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              case "blob":
                return (
                  <div key={field.id}>
                    <label className="block text-base font-medium text-gray-700">
                      {field.display}
                    </label>
                    <input
                      type="file"
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      onChange={(e) => handleValueChange(field.id, e.target.value)}
                    />
                  </div>
                );
              default:
                return null;
            }
          })}
          <button
            type="button"
            className={`w-full px-4 py-2 text-white rounded-lg shadow hover:bg-slate-600 focus:outline-none focus:ring focus:ring-black-300 ${isSubmitting ? "bg-indigo-500" : "bg-slate-500"
              }`}
            disabled={isSubmitting}
            onClick={submitForm}
          >
            {isSubmitting ? <Spinner /> : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShareFormComponent;