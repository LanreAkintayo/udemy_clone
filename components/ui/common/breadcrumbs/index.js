import Link from "next/link";
import React, { useState, useEffect } from "react";
import { ActiveLink } from "@components/ui/common";

const BreadcrumbItem = ({index ,href, value }) => {
  return (
    <li
      className={`${
        index == 0 ? "pr-4" : "px-4"
      } font-medium mr-8 text-gray-500 hover:text-gray-900`}
    >
      <ActiveLink href={href}>
        <a>{value}</a>
      </ActiveLink>
    </li>
  );
};

export default function Breadcrumbs({ isAdmin, items }) {
  return (
    <nav aria-label="breadcrumb">
      <ol className="flex leading-none text-indigo-600 divide-x divide-indigo-400">
        {items.map((item, index) => {
          return (
            <React.Fragment key={item.href}>
              {isAdmin ? (
                <BreadcrumbItem index={index} href={item.href} value={item.value} />
              ) : (
                !item.requireAdmin && (
                  <BreadcrumbItem index={index} href={item.href} value={item.value} />
                )
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

/*

Create some kind of hook that will keep track of the current account. If the current account is the admin account, disable manage courses list otherwise, do not disable it.

*/
