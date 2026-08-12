// client/src/hooks/useDepartments.js
import { useEffect, useState } from "react";
import { departmentApi } from "../api/department.api";

export default function useDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    departmentApi
      .list()
      .then(({ data }) => setDepartments(data.data))
      .finally(() => setLoading(false));
  }, []);

  return { departments, loading };
}
