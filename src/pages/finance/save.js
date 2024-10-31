

{/* Finance */}
<SidebarLinkGroup activecondition={pathname.includes("finance")}>
  {(handleClick, open) => {
    return (
      <React.Fragment>
        {/* ... existing code ... */}
        <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
          <ul className={`pl-8 mt-1 ${!open && "hidden"}`}>
            {/* ... existing menu items ... */}
            <li className="mb-1 last:mb-0">
              <NavLink
                end
                to="/finance/dashboard"
                className={({ isActive }) =>
                  "block transition duration-150 truncate " +
                  (isActive
                    ? "text-violet-500"
                    : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                }
              >
                <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                  Dashboard
                </span>
              </NavLink>
            </li>
          </ul>
        </div>
      </React.Fragment>
    );
  }}
</SidebarLinkGroup>
