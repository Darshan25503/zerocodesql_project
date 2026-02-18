import { forwardRef } from "react";
import { FaRegCopy } from "react-icons/fa6";
import toast, { Toaster } from "react-hot-toast";
interface ApiKeyPopupProps {
  apiKey: string | null;
}

const ApiKeyPopup = forwardRef<HTMLDialogElement, ApiKeyPopupProps>(
  ({ apiKey }, ref) => {
    const handleCopy = () => {
      if (apiKey) {
        navigator.clipboard.writeText(apiKey);
        toast.success("API Key copied to clipboard!", {
          style: {
            zIndex: 10, // Ensure the toast appears above the modal
          },
        });
      }
    };

    return (
      <dialog className="modal" ref={ref}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Your API Key</h3>
          <span>Here is your API key. Copy and store it securely.</span>

          <div className="mt-4 flex items-center">
            <div className="flex-grow bg-gray-100 p-2 rounded">
            <input
            type="text"
            value={apiKey}
            readOnly
            className="input input-bordered text-black inline-flex h-[35px] w-full flex-1 rounded-[4px] px-[10px] text-[15px] leading-none overflow-hidden text-ellipsis"
            style={{
              maxWidth: "100%", // Set a fixed width for the key display
              whiteSpace: "nowrap", 
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          />
            </div>
            <FaRegCopy
              className="ml-4 cursor-pointer text-2xl text-gray-600 hover:text-black"
              onClick={handleCopy}
            />
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn hover:bg-red-600 hover:text-white">
                Close
              </button>
            </form>
          </div>
        </div>
        <Toaster 
        toastOptions={{
          style: {
            zIndex: 10, // Ensure the toast appears above the modal
          },
        }}
      />
      </dialog>
    );
  }
);

ApiKeyPopup.displayName = "ApiKeyPopup";
export default ApiKeyPopup;
