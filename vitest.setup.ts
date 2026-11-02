import { installDialog } from "@/test/dialog";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vite-plus/test";

installDialog();

afterEach(cleanup);
