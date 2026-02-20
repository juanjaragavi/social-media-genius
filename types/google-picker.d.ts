/**
 * Google Picker TypeScript declarations
 *
 * Minimal typings for the Google Picker API loaded via
 * https://apis.google.com/js/api.js
 */

interface Window {
  gapi: {
    load: (api: string, callback: () => void) => void;
  };
  google: {
    picker: typeof google.picker;
  };
}

declare namespace google.picker {
  enum Action {
    PICKED = "picked",
    CANCEL = "cancel",
  }

  enum ViewId {
    DOCS = "all",
    FOLDERS = "folders",
  }

  interface Document {
    id: string;
    name: string;
    mimeType: string;
    url: string;
  }

  interface ResponseObject {
    action: Action;
    docs: Document[];
  }

  class DocsView {
    constructor(viewId?: ViewId);
    setIncludeFolders(include: boolean): DocsView;
    setSelectFolderEnabled(enabled: boolean): DocsView;
    setMimeTypes(mimeTypes: string): DocsView;
  }

  class PickerBuilder {
    addView(view: DocsView): PickerBuilder;
    setOAuthToken(token: string): PickerBuilder;
    setDeveloperKey(key: string): PickerBuilder;
    setCallback(callback: (data: ResponseObject) => void): PickerBuilder;
    setTitle(title: string): PickerBuilder;
    build(): Picker;
  }

  class Picker {
    setVisible(visible: boolean): void;
  }
}
