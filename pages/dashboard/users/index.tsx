import { ReactElement, ReactNode, useEffect, useState } from "react";
import DashboardLayout from "../../../src/components/layouts/dashboard";
import UserStats from "../../../src/components/dashboard/user/user-statistics";
import UserTable from "../../../src/components/dashboard/user/user-table";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStatistics>();
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 10;
  const totalPages = Math.floor(users.length / 10);

  useEffect(() => {
    fetchAndStoreUsers();
  }, []);

  useEffect(() => {
    const filteredUsers = users.filter(
      (_, index) =>
        index >= (currentPage - 1) * PER_PAGE &&
        index < (currentPage - 1) * PER_PAGE + PER_PAGE
    );
    setFilteredUsers(filteredUsers);
  }, [currentPage, users]);

  useEffect(() => {
    const stats = {
      users: 0,
      active_users: 0,
      users_with_loans: 0,
      users_with_savings: 0,
    };
    if (users) {
      users.map((u) => {
        stats.users++;
        if (new Date(Date.now()) < new Date(u.lastActiveDate ?? "")) {
          stats.active_users++;
        }
      });
    }
    setUserStats(stats);
  }, [users]);

  const fetchAndStoreUsers = async () => {
    const usersSerialized = localStorage.getItem("users");
    if (!usersSerialized) {
      const res = await fetch(
        "https://6270020422c706a0ae70b72c.mockapi.io/lendsqr/api/v1/users"
      );
      if (res.ok) {
        const data = (await res.json()) as User[];
        setUsers(data);
        localStorage.setItem("users", JSON.stringify(data));
      }
    } else {
      setUsers(JSON.parse(usersSerialized));
    }
  };

  return (
    <DashboardLayout>
      <div className="mt-5 md:mt-15">
        <h2 className="font-medium text-2xl text-secondary-400">Users</h2>
        <div className="my-5 md:my-10">
          {userStats ? <UserStats data={userStats} /> : null}
        </div>
        <div className="h-[400px]  overflow-auto">
          <div className="min-w-[1024px]">
            <UserTable users={filteredUsers} openFilterPane={() => null} />
          </div>
        </div>
        <div className="flex md:flex-row flex-col items-center justify-between mt-10 gap-2.5">
          <span className="text-sm text-secondary-100">
            Showing{" "}
            <span className="inline-block px-2 py-1 rounded-md text-secondary-400 font-medium bg-secondary-100 bg-opacity-20">
              {currentPage * PER_PAGE}
            </span>{" "}
            out of {users.length}
          </span>
          <Paginator {...{ currentPage, totalPages, setCurrentPage }} />
        </div>
      </div>
    </DashboardLayout>
  );
};
export default UsersPage;

interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (pageNumber: number) => void;
}
const Paginator: React.FC<PaginatorProps> = ({
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  const [elements, setElements] = useState<ReactElement[]>([]);
  useEffect(() => {
    const elts = [];
    if (totalPages > 3) {
      if (currentPage === 1) {
        for (let i = 1; i <= 3; i++) {
          elts.push(
            <button
              onClick={() => currentPage !== i && setCurrentPage(i)}
              className={`p-2 mx-1 ${
                i === 1
                  ? "text-secondary-400 font-semibold"
                  : "text-secondary-100"
              }`}
            >
              {i}
            </button>
          );
        }
      } else {
        for (let i = 0; i < 3; i++) {
          const value = currentPage - 1 + i;
          if (currentPage < totalPages - 1)
            elts.push(
              <button
                onClick={() => currentPage !== i && setCurrentPage(value)}
                className={`p-2 mx-1 ${
                  currentPage === value
                    ? "text-secondary-400 font-semibold"
                    : "text-secondary-100"
                }`}
              >
                {value}
              </button>
            );
        }
      }
      if (totalPages - currentPage > 3) {
        elts.push(<span className="text-secondary-100">...</span>);
      }
      for (let i = totalPages - 1; i <= totalPages; i++) {
        elts.push(
          <button
            onClick={() => currentPage !== i && setCurrentPage(i)}
            className={`p-2 mx-1 ${
              currentPage === i
                ? "text-secondary-400 font-semibold"
                : "text-secondary-100"
            }`}
          >
            {i}
          </button>
        );
      }
    }
    setElements(elts);
  }, [currentPage, totalPages]);

  return (
    <div className="flex items-center">
      <button
        onClick={() =>
          setCurrentPage(currentPage !== 1 ? currentPage - 1 : currentPage)
        }
        className="p-1 bg-secondary-400 bg-opacity-10 h-fit rounded-sm"
      >
        {/* prettier-ignore */}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" >
            <g opacity="0.6">
            <path d="M10.0061 11.0573C10.8472 11.8984 9.54344 13.1595 8.745 12.3184L3.99424 7.56759C3.61581 7.23127 3.61581 6.64282 3.99424 6.3065L8.61858 1.64002C9.45967 0.841037 10.7208 2.10267 9.87967 2.94322L5.8859 6.937L10.0061 11.0573Z" fill="#213F7D"/>
            </g>
        </svg>
      </button>
      <div className="flex items-center text-sm font-body">{elements}</div>

      <button
        onClick={() =>
          setCurrentPage(
            currentPage !== totalPages ? currentPage + 1 : currentPage
          )
        }
        className="p-1 bg-secondary-400 bg-opacity-10 h-fit rounded-sm"
      >
        {/* prettier-ignore */}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3.99391 2.94274C3.15281 2.10165 4.45656 0.840502 5.255 1.68165L10.0058 6.43241C10.3842 6.76873 10.3842 7.35718 10.0058 7.6935L5.38142 12.36C4.54033 13.159 3.27918 11.8973 4.12033 11.0568L8.1141 7.063L3.99391 2.94274Z" fill="#213F7D"/>
        </svg>
      </button>
    </div>
  );
};

export interface UserStatistics {
  users: number;
  active_users: number;
  users_with_loans: number;
  users_with_savings: number;
}

export interface User {
  createdAt: string;
  orgName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  lastActiveDate: string;
  profile: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    avatar: string;
    gender: string;
    bvn: string;
    address: string;
    currency: string;
  };
  guarantor: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    gender: string;
    address: string;
  };
  accountBalance: string;
  accountNumber: string;
  socials: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
  education: {
    level: string;
    employmentStatus: string;
    sector: string;
    duration: string;
    officeEmail: string;
    monthlyIncome: string[];
    loanRepayment: string;
  };
  id: string;
}
