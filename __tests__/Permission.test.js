import { render } from "@testing-library/react";
import '@testing-library/jest-dom'
import * as nextAuth from "next-auth"
import Permission, { checkPermission } from "@/app/components/Permission";
import { redirect } from 'next/navigation';


jest.mock("next-auth", () => ({getServerSession: jest.fn()}));
jest.mock("next/navigation", () => ({redirect: jest.fn(() => {})}));
jest.mock("../src/lib/auth", () => ({authOptions: {}}));

describe("Permission", () => {
  it("should render correctly", async () => {
    expect(render(await Permission({permission: "test", redirectTo: "/test", children: <h1>test</h1>}))).to
  });

  it("should render correctly", async () => {
    render(await Permission({permission: "test", redirectTo: "/test", children: <h1>test</h1>}));
  });

  it("should render correctly", async () => {
    nextAuth.getServerSession.mockResolvedValue({user: {}});
    render(await Permission({permission: "test", redirectTo: "/test", children: <h1>test</h1>}));
  });

  it("should render correctly", async () => {
    nextAuth.getServerSession.mockResolvedValue({user: {permissions: ['test1', 'test2']}});
    render(await Permission({permission: "test", redirectTo: "/test", children: <h1>test</h1>}));
    expect(redirect).toHaveBeenCalledWith("/test");
  });

  it("should render correctly", async () => {
    nextAuth.getServerSession.mockResolvedValue({user: {permissions: ['test1', 'test2']}});
    render(await Permission({permission: "test", children: <h1>test</h1>}));
    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("should work correctly", () => {
    checkPermission('test');
    expect(redirect).toHaveBeenCalledWith('/');
  });
});
