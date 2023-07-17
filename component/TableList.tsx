import React from "react"
import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import { Button } from "@nextui-org/react"


const TableList: React.FC = () => {
    const [tableData, setTableData] = useState([]);
    const router = useRouter()

    useEffect(() => {
      const getData = async () => {
          const response = await fetch(`/api/table`);
          const data = await response.json();
          setTableData(data)
      }
      getData()
  },[]);
  
  return (
      <div className="justify-items-center">
        <h2 className="font-semibold text-2xl text-center">Table List</h2>
          {tableData.map((table) => (
            <Button className="m-4 bg-sky-500" key={table.table_name} onPress={() => router.push(`/${table.table_name}`)}>
                {table.table_name}
            </Button>
          ))}
      </div>
  )
}

export default TableList
