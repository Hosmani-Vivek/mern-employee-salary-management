import { useState, useEffect } from "react";
import Layout from "../../../../layout";
import { Link, useNavigate } from "react-router-dom";
import { Breadcrumb, ButtonOne } from "../../../../components";
import { FaRegEdit, FaPlus } from "react-icons/fa";
import { BsTrash3 } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  deleteDataPegawai,
  getDataPegawai,
  getMe,
} from "../../../../config/redux/action";
import { BiSearch } from "react-icons/bi";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
  MdOutlineKeyboardArrowDown,
} from "react-icons/md";

const ITEMS_PER_PAGE = 4;

const DataPegawai = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isError, user } = useSelector((state) => state.auth);
  const { dataPegawai } = useSelector((state) => state.dataPegawai);

  const totalPages = Math.ceil(dataPegawai.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const filteredDataPegawai = dataPegawai.filter((pegawai) => {
    const { nama_pegawai, status } = pegawai;
    const keyword = searchKeyword.toLowerCase();
    const statusKeyword = filterStatus.toLowerCase();
    return (
      nama_pegawai.toLowerCase().includes(keyword) &&
      (filterStatus === "" || status.toLowerCase() === statusKeyword)
    );
  });

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleSearch = (event) => {
    setSearchKeyword(event.target.value);
  };

  const handleFilterStatus = (event) => {
    setFilterStatus(event.target.value);
  };

  const onDeletePegawai = (id) => {
    Swal.fire({
      title: "Konfirmasi",
      text: "Apakah Anda yakin ingin Menghapus?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteDataPegawai(id)).then(() => {
          Swal.fire({
            title: "Berhasil",
            text: "Data pegawai berhasil dihapus.",
            icon: "success",
            timer: 1000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          dispatch(getDataPegawai());
        });
      }
    });
  };

  const exportToCSV = () => {
    // data_pegawai fields available:
    const headers = [
      "NIK",
      "Nama Pegawai",
      "Jabatan",
      "Designation",
      "Jenis Kelamin",
      "Status",
      "Tanggal Masuk",
    ];

    const rows = dataPegawai.map((emp) => [
      emp.nik,
      emp.nama_pegawai,
      emp.jabatan,
      emp.designation || "-",
      emp.jenis_kelamin,
      emp.status,
      emp.tanggal_masuk,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((val) => `"${val}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "data_pegawai.csv";
    link.click();
  };

  useEffect(() => {
    dispatch(getDataPegawai(startIndex, endIndex));
  }, [dispatch, startIndex, endIndex]);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      navigate("/login");
    }
    if (user && user.hak_akses !== "admin") {
      navigate("/dashboard");
    }
  }, [isError, user, navigate]);

  const paginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    const startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisiblePages / 2),
    );
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`border border-gray-2 px-4 py-2 font-semibold text-black dark:border-strokedark dark:text-white ${
            currentPage === page
              ? "bg-primary text-white hover:bg-primary dark:bg-primary dark:hover:bg-primary"
              : "hover:bg-gray-2 dark:hover:bg-stroke"
          } rounded-lg`}>
          {page}
        </button>,
      );
    }

    if (startPage > 2) {
      items.unshift(
        <p
          key="start-ellipsis"
          className="border border-gray-2 bg-gray px-4 py-2 font-medium text-black dark:border-strokedark dark:bg-transparent dark:text-white">
          ...
        </p>,
      );
    }

    if (endPage < totalPages - 1) {
      items.push(
        <p
          key="end-ellipsis"
          className="border border-gray-2 bg-gray px-4 py-2 font-medium text-black dark:border-strokedark dark:bg-transparent dark:text-white">
          ...
        </p>,
      );
    }

    return items;
  };

  return (
    <Layout>
      <Breadcrumb pageName="Data Pegawai" />
      <Link to="/data-pegawai/form-data-pegawai/add">
        <ButtonOne>
          <span>Tambah Pegawai</span>
          <span>
            <FaPlus />
          </span>
        </ButtonOne>
        <ButtonOne
          onClick={exportToCSV}
          className="bg-green-600 hover:bg-green-700 flex items-center gap-2 rounded px-4 py-2 text-white">
          ⬇ Download CSV
        </ButtonOne>
      </Link>
      <div className="mt-6 rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="mt-4 flex flex-col items-center justify-between md:flex-row md:justify-between">
          <div className="relative mb-4 flex-1 md:mb-0 md:mr-2">
            <div className="relative">
              <span className="absolute left-48 top-1/2 z-30 -translate-y-1/2 text-xl">
                <MdOutlineKeyboardArrowDown />
              </span>
              <select
                value={filterStatus}
                onChange={handleFilterStatus}
                className="relative appearance-none rounded border border-stroke bg-transparent px-8 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input">
                <option value="">Status</option>
                <option value="Karyawan Tetap">Karyawan Tetap</option>
                <option value="Karyawan Tidak Tetap">
                  Karyawan Tidak Tetap
                </option>
              </select>
            </div>
          </div>
          <div className="flex-2 relative mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Cari Nama Pegawai..."
              value={searchKeyword}
              onChange={handleSearch}
              className="left-0 rounded-lg border-[1.5px] border-stroke bg-transparent py-2 pl-10 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            />
            <span className="absolute left-2 py-3 text-xl">
              <BiSearch />
            </span>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto py-4">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                  No
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                  Photo
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                  NIK
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Nama Pegawai
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Jenis Kelamin
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Tanggal Masuk
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Status
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Hak Akses
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDataPegawai
                .slice(startIndex, endIndex)
                .map((data, index) => {
                  return (
                    <tr key={data.id}>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-center text-black dark:text-white">
                          {startIndex + index + 1}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark">
                        <div className="h-12.5 w-15">
                          <div className="overflow-hidden rounded-full">
                            <img
                              src={`http://localhost:5000/images/${data.photo}`}
                              alt="Photo Profil"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-center text-black dark:text-white">
                          {data.nik}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {data.nama_pegawai}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {data.jenis_kelamin}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {data.tanggal_masuk}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {data.status}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {data.hak_akses}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <div className="flex items-center space-x-3.5">
                          <Link
                            to={`/data-pegawai/form-data-pegawai/edit/${data.id}`}
                            className="hover:text-black">
                            <FaRegEdit className="text-xl text-primary hover:text-black dark:hover:text-white" />
                          </Link>
                          <button
                            onClick={() => onDeletePegawai(data.id)}
                            className="hover:text-black">
                            <BsTrash3 className="text-xl text-danger hover:text-black dark:hover:text-white" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col items-center justify-between md:flex-row md:justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-gray-5 dark:text-gray-4 py-4 text-sm">
              Menampilkan {startIndex + 1}-
              {Math.min(endIndex, filteredDataPegawai.length)} dari{" "}
              {filteredDataPegawai.length} Data Pegawai
            </span>
          </div>
          <div className="flex space-x-2 py-4">
            <button
              disabled={currentPage === 1}
              onClick={goToPrevPage}
              className="rounded-lg border border-primary px-6 py-2 font-semibold text-primary hover:bg-primary hover:text-white disabled:opacity-50 dark:border-primary dark:text-white dark:hover:bg-primary dark:hover:text-white">
              <MdKeyboardDoubleArrowLeft />
            </button>
            {paginationItems()}
            <button
              disabled={currentPage === totalPages}
              onClick={goToNextPage}
              className="rounded-lg border border-primary px-6 py-2 font-semibold text-primary hover:bg-primary hover:text-white disabled:opacity-50 dark:border-primary dark:text-white dark:hover:bg-primary dark:hover:text-white">
              <MdKeyboardDoubleArrowRight />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DataPegawai;
