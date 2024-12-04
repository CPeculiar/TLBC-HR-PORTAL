import Image01 from '../../images/user/user-36-05.jpg';
import Image02 from '../../images/user/user-36-06.jpg';
import Image03 from '../../images/user/user-36-07.jpg';
import Image04 from '../../images/user/user-10.png';
import Image05 from '../../images/user/user-12.png';

const brandData = [ // Removed type annotation
  {
    logo: Image01,
    name: 'Michelle Okonkwo',
    phone: '09013550819',
    dob: 'Aug 18',
    church: 'TLBC Awka',
  },
  {
    logo: Image02,
    name: 'Collins Nwokozor ',
    phone: '08130543765',
    dob: 'Aug25',
    church: 'TLBC Awka',
  },
  {
    logo: Image03,
    name: 'Michael Mmaduburum',
    phone: '09021098669',
    dob: 'Sept 14',
    church: 'TLBC Ihiala',
  },
  {
    logo: Image04,
    name: 'Amaka Aham',
    phone: '09067493068',
     dob: 'Sept 24',
     church: 'TLBC Awka',
  },
  {
    logo: Image05,
    name: 'Ebuka Nwankwo',
    phone: '08105606440',
    dob: 'Sept 30',
    church: 'TLBC Ekwulobia',
  },
];

const TableOne = () => {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Upcoming Birthdays
      </h4>

    {/* Desktop Table */}
      {/* <div className="flex flex-col"> */} <div className="hidden sm:block">
      
        <div className="grid grid-cols-5 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Name
            </h5>
          </div>
          <div>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
             Phone
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              CHURCH
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
             DOB
            </h5>
          </div>
        </div>

        {brandData.map((brand, key) => (
          <div
            className={`grid grid-cols-3 sm:grid-cols-5 ${
              key === brandData.length - 1
                ? ''
                : 'border-b border-stroke dark:border-strokedark'
            }`}
            key={key}
          >
            <div className="flex items-center gap-3 p-2.5 xl:p-5">
              <div className="flex-shrink-0">
                <img src={brand.logo} alt="Brand" />
              </div>
              <p className="hidden text-black dark:text-white sm:block whitespace-nowrap">
                {brand.name}
              </p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white"></p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{brand.phone}</p>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-black dark:text-white">{brand.church}</p>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-meta-3">{brand.dob}</p>
            </div>
          </div>
        ))}
      </div>



       {/* Mobile Scrollable Table */}
       <div className="block sm:hidden overflow-x-auto">
       <div className="p-3">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50">
              <tr>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-left">Name</div>
                </th>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-left">Phone</div>
                </th>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-left">Church</div>
                </th>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-center">Dob</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/60">
              {brandData.map((brand, key) => (
                <tr key={key}>
                  <td className="p-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 shrink-0 mr-2 sm:mr-3">
                        <img className="rounded-full" src={brand.logo} width="40" height="40" alt={brand.name} />
                      </div>
                      <div className="font-medium text-gray-800 dark:text-gray-100">{brand.name}</div>
                    </div>
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    <div className="text-left">{brand.phone}</div>
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    <div className="text-left font-medium">{brand.church}</div>
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    <div className="text-sm text-center text-green-500">{brand.dob}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  );
};

export default TableOne;
