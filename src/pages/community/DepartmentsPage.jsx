import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Phone, Calendar, User, X } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const DepartmentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [expandedDepartments, setExpandedDepartments] = useState({});
  const [selectedExco, setSelectedExco] = useState(null);

  // All departments data from the file
  const departments = [
    {
      name: "MEDIA DEPARTMENT",
      excos: [
        { position: "H.O.D", name: "Pastor Kenechukwu Chukwukelue", phone: "09031868409", dob: "18th August" },
        { position: "ASSISTANT", name: "Peculiar Chukwudi", phone: "07065649583", dob: "21st January" },
        { position: "SECRETARY", name: "Chibueze Ezechukwu", phone: "08069725821", dob: "9th October" },
        { position: "FINANCIAL SECRETARY", name: "Pastor Mmesoma Okafor", phone: "07035913268", dob: "19th June" },
        { position: "P.R.O", name: "Peculiar Chukwudi", phone: "07065649583", dob: "21st January" }
      ]
    },
    {
      name: "LIGHT OF LIFE DEPARTMENT",
      excos: [
        { position: "H.O.D", name: "Pastor Mmesoma Okafor", phone: "07035913268", dob: "19th June" },
        { position: "ASSISTANT", name: "Pastor Kenechukwu Chukwukelue", phone: "09031868409", dob: "18th August" },
        { position: "SECRETARY", name: "Pastor Divine Nwolisa", phone: "07036480474", dob: "4th December" },
        { position: "FINANCIAL SECRETARY", name: "Reuben Faruna", phone: "08100692699", dob: "13th September" }
      ]
    },
    {
      name: "CHILDREN DEPARTMENT",
      excos: [
        { position: "H.O.D", name: "Pastor Chinelo Okeke", phone: "07032351655", dob: "23rd January" },
        { position: "ASSISTANT", name: "Chinenye Ogbonna", phone: "08023402456", dob: "13th September" },
        { position: "SECRETARY", name: "Precious Ndubuisi", phone: "09138912049", dob: "7th June" }
      ]
    },
    {
      name: "WELCOMING TEAM",
      excos: [
        { position: "H.O.D", name: "Pastor Chizoba Okeke", phone: "07032581169", dob: "30th December" },
        { position: "ASSISTANT", name: "Chukwuma Ebeh", phone: "08089192844", dob: "4th December" },
        { position: "SECRETARY", name: "Ifeoma Ikemefuna", phone: "07087969701", dob: "28th October" },
        { position: "FINANCIAL SECRETARY", name: "Chinecherem Asoume", phone: "08100692699", dob: "14th April" },
        { position: "P.R.O", name: "Emmanuel Chuwkwuemeka", phone: "08027138286", dob: "24th December" }
      ]
    },
    {
      name: "PROTOCOL",
      excos: [
        { position: "H.O.D", name: "Pastor Divine Nwolisa", phone: "07036480474", dob: "5th December" },
        { position: "ASSISTANT", name: "Reuben Faruna", phone: "08100692699", dob: "13th September" },
        { position: "SECRETARY", name: "Michael Nweke", phone: "09114052136", dob: "29th May" }
      ]
    },
    {
      name: "CELL MINISTRY",
      excos: [
        { position: "H.O.D", name: "Evangelist Chidinma Egwu", phone: "08167353945", dob: "1st March" },
        { position: "ASSISTANT", name: "Patrick Okeke", phone: "08143432716", dob: "4th October" },
        { position: "SECRETARY", name: "Wisdom Akpunkwu", phone: "08108150846", dob: "7th January" },
        { position: "FINANCIAL SECRETARY", name: "Ifeyinwa Onwuteaka", phone: "08100692699", dob: "13th September" },
        { position: "P.R.O", name: "Chukwuma Ebeh", phone: "08089192844", dob: "4th December" }
      ]
    },
    {
      name: "FOUNDATION SCHOOL",
      excos: [
        { position: "H.O.D", name: "Precious Mbanekwu", phone: "08164625136", dob: "26th June" },
        { position: "ASSISTANT", name: "Emmanuel Chuwkwuemeka", phone: "08027138286", dob: "24th December" },
        { position: "SECRETARY", name: "Michelle Okonkwo", phone: "09013550819", dob: "22nd December" },
        { position: "P.R.O", name: "Marvelous Chiaghanam", phone: "08160229741", dob: "19th Januaury" }
      ]
    },
    {
      name: "MUSIC DEPARTMENT",
      excos: [
        { position: "H.O.D", name: "Amara Azuka", phone: "09033699507", dob: "11th February" },
        { position: "ASSISTANT", name: "Onyinye Ojeani", phone: "07012406193", dob: "24th June" },
        { position: "SECRETARY", name: "Godswill Nweke", phone: "09050226093", dob: "2nd October" },
        { position: "ASSISTANT SECRETARY", name: "Faith Ibikunle", phone: "09157035384", dob: "17th May" },
        { position: "FINANCIAL SECRETARY", name: "Divine-Gift Chukwudi", phone: "09037993884", dob: "16th November" },
        { position: "P.R.O", name: "Chinaza Favour Chiafor", phone: "08135945186", dob: "9th June" }
      ]
    },
    {
      name: "USHERING DEPARTMENT",
      excos: [
        { position: "H.O.D", name: "Patrick Okeke", phone: "08143432716", dob: "4th October" },
        { position: "ASSISTANT", name: "Ifunanya Molokwu", phone: "07038769292", dob: "5th April" },
        { position: "SECRETARY", name: "Chiamaka Aham", phone: "09078177504", dob: "25th March" },
        { position: "FINANCIAL SECRETARY", name: "Chioma Madugbugwu", phone: "08169417023", dob: "3rd August" },
        { position: "P.R.O", name: "Ozioma Chiafor", phone: "09139063635", dob: "19th January" }
      ]
    },
    {
      name: "TECHNICAL DEPARTMENT",
      excos: [
        { position: "H.O.D", name: "Samson Nwedo", phone: "08107520428", dob: "22nd June" },
        { position: "ASSISTANT", name: "Emmanuella Ogamba", phone: "08134920149", dob: "28 September" },
        { position: "SECRETARY", name: "Blessing Okafor", phone: "07011693365", dob: "11th July" },
        { position: "FINANCIAL SECRETARY", name: "Godsnature Okonkwo", phone: "07034190556", dob: "17th August" },
        { position: "P.R.O", name: "Israel Chukwudi", phone: "07047139340", dob: "29th August" }
      ]
    },
    {
      name: "STAGE MANAGEMENT DEPARTMENT",
      excos: [
        { position: "H.O.D", name: "Kelvin Onuigbo", phone: "08060281704", dob: "24th August" },
        { position: "ASSISTANT", name: "Blessing Okafor", phone: "07011693365", dob: "11th July" },
        { position: "SECRETARY", name: "Chetachukwu Onwe", phone: "09118272065", dob: "1st February" }
      ]
    },
    {
      name: "LEADERSHIP AND TECH DEPARTMENT",
      excos: [
        { position: "H.O.D", name: "Peculiar Chukwudi", phone: "07065649583", dob: "21st January" },
        { position: "ASSISTANT", name: "Chukwuma Ebeh", phone: "08089192844", dob: "4th December" },
        { position: "SECRETARY", name: "Collins Nwakozor", phone: "08130543765", dob: "2nd March" },
        { position: "P.R.O", name: "Royalty Mbagwu", phone: "07081398086", dob: "26th March" }
      ]
    },
    {
      name: "MEDICAL DEPARTMENT",
      excos: [
        { position: "H.O.D", name: "Israel Chukwudi", phone: "07047139340", dob: "29th August" },
        { position: "ASSISTANT", name: "Chisom Ikechukwu", phone: "09021407128", dob: "29th September" },
        { position: "SECRETARY", name: "Chiamaka Juilet Anene", phone: "08137956639", dob: "12th October" },
        { position: "P.R.O", name: "Divinegift Chukwudi", phone: "09037993884", dob: "16th November" }
      ]
    },
    {
      name: "VENUE MANAGEMENT DEPARTMENT",
      excos: [
        { position: "H.O.D", name: "Ndubusi Edeh", phone: "07019897862", dob: "13th March" },
        { position: "ASSISTANT", name: "Michelle Okonkwo", phone: "09013550819", dob: "22nd December" },
        { position: "SECRETARY", name: "Chibuike Igwebuike", phone: "08033348099", dob: "12th June" },
        { position: "P.R.O", name: "Chetachukwu Onwe", phone: "09118272065", dob: "1st February" }
      ]
    },
    {
      name: "DECORATORS DEPARTMENT",
      excos: [
        { position: "H.O.D", name: "Ogechukwu Ikechukwu", phone: "08131550153", dob: "20th September" },
        { position: "ASSISTANT", name: "Annabel Mgbenwelu", phone: "09164953972", dob: "27th November" },
        { position: "SECRETARY", name: "Chiamaka Juilet Anene", phone: "08137956639", dob: "12th October" }
      ]
    },
    {
      name: "WELFARE DEPARTMENT",
      excos: [
        { position: "H.O.D", name: "Reuben Faruna", phone: "08100692699", dob: "13th September" },
        { position: "ASSISTANT", name: "Chidera Onwuteaka", phone: "07014131317", dob: "21st January" },
        { position: "SECRETARY", name: "Chiamaka Aham", phone: "09078177504", dob: "25th March" },
        { position: "FINANCIAL SECRETARY", name: "Israel Chukwudi", phone: "07047139340", dob: "29th August" },
        { position: "P.R.O", name: "Oluebube Ejimmadu", phone: "08163157080", dob: "5th April" }
      ]
    },
    {
      name: "TRANSPORTATION DEPARTMENT",
      excos: [
        { position: "H.O.D", name: "Chidiebere Chukwuemeka", phone: "08130913470", dob: "23rd September" },
        { position: "ASSISTANT", name: "Oluebube Ejimmadu", phone: "08163157080", dob: "5th April" }
      ]
    },
    {
      name: "SECURITY DEPARTMENT",
      excos: [
        { position: "H.O.D", name: "Chibueze Ezechukwu", phone: "08069725821", dob: "9th October" },
        { position: "ASSISTANT", name: "Michael Mmaduburum", phone: "08069725821", dob: "15th March" },
        { position: "SECRETARY", name: "Ndubusi Edeh", phone: "07019897862", dob: "13th March" },
        { position: "FINANCIAL SECRETARY", name: "Godsnature Okonkwo", phone: "07034190556", dob: "17th August" },
        { position: "P.R.O", name: "Ruth Philip", phone: "08105751123", dob: "4th November" }
      ]
    },
    {
      name: "EQUIPMENT MANAGEMENT DEPARTMENT",
      excos: [
        { position: "H.O.D", name: "Michael Nweke", phone: "09114052136", dob: "29th May" },
        { position: "ASSISTANT", name: "Wisdom Akpunkwu", phone: "08108150846", dob: "7th January" },
        { position: "SECRETARY", name: "Marvelous Chiaghanam", phone: "08160229741", dob: "19th January" }
      ]
    },
    {
      name: "WEALTHY PLACE",
      excos: [
        { position: "H.O.D", name: "Chidiebere Chukwuemeka", phone: "08130913470", dob: "23rd September" },
        { position: "ASSISTANT", name: "Light Obiegbu", phone: "08066670852", dob: "1st December" },
        { position: "SECRETARY", name: "Emmanuel Chuwkwuemeka", phone: "08027138286", dob: "24th December" },
        { position: "FINANCIAL SECRETARY", name: "Kelvin Onuigbo", phone: "08060281704", dob: "24th August" },
        { position: "P.R.O", name: "Somtochukwu Molokwo", phone: "09034042896", dob: "5th March" }
      ]
    },
    {
      name: "TLBCM",
      excos: [
        { position: "COORDONATOR", name: "Ebenezer Nwolisa", phone: "09039675336", dob: "28th August" },
        { position: "ASSISTANT", name: "Uche Ndubuisi", phone: "07065278722", dob: "11th August" },
        { position: "SECRETARY", name: "Chisom Ogbonna", phone: "09124152276", dob: "26th August" },
        { position: "FINANCIAL SECRETARY", name: "Chukwuma Ebeh", phone: "08089192844", dob: "4th December" },
        { position: "P.R.O", name: "Marvelous Chiaghanam", phone: "08160229741", dob: "19th Januaury" }
      ]
    },
    {
      name: "TLTN",
      excos: [
        { position: "COORDINATOR", name: "Pastor Divine Nwolisa", phone: "07036480374", dob: "5th December" },
        { position: "ASSISTANT", name: "Michelle Okonkwo", phone: "09013550819", dob: "22nd December" },
        { position: "SECRETARY", name: "Sochima Nweke", phone: "09156450639", dob: "4th November" },
        { position: "FINANCIAL SECRETARY", name: "Collins Nwakozor", phone: "08130543765", dob: "2nd March" },
        { position: "P.R.O", name: "Emeka Nweke", phone: "09120119224", dob: "19th July" }
      ]
    },
    {
      name: "TEAM 1000",
      excos: [
        { position: "COORDINATOR", name: "Pastor Divine Nwolisa", phone: "07036480374", dob: "5th December" },
        { position: "ASSISTANT", name: "Precious Mbanekwu", phone: "08164625136", dob: "26th June" },
        { position: "SECRETARY", name: "Patrick Okeke", phone: "08143432716", dob: "4th October" }
      ]
    },
    {
      name: "MINISTRY BUREAU",
      excos: [
        { position: "DIRECTOR", name: "Pastor Eloka Okeke", phone: "08064430141", dob: "11th January" },
        { position: "ASSISTANT", name: "Amara Azuka", phone: "09033699507", dob: "11th February" },
        { position: "CABINET SECRETARY", name: "Chinenye Ogbonna", phone: "08023402456", dob: "13th September" },
        { position: "C.E.O", name: "Faith Bidiki", phone: "08084944905", dob: "26th November" }
      ]
    }
  ];

  // Toggle expand/collapse for department
  const toggleDepartment = (deptName) => {
    setExpandedDepartments(prev => ({
      ...prev,
      [deptName]: !prev[deptName]
    }));
  };

  // Filter departments based on search term
  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.excos.some(exco => 
      exco.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exco.position.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Handle exco click to show details modal
  const handleExcoClick = (exco) => {
    setSelectedExco(exco);
  };

  // Random background colors for department cards (using your color scheme)
  const getBgColor = (index) => {
    const colors = [
      'bg-blue-600',
      'bg-purple-600',
      'bg-red-600',
      'bg-green-600',
      'bg-yellow-600',
      'bg-indigo-600',
      'bg-pink-600'
    ];
    return colors[index % colors.length];
  };

  return (
    <>
      <Breadcrumb pageName="TLBC Departments" />

      <div className="p-2 sm:p-4 md:p-6 2xl:p-10 bg-gray-50 dark:bg-boxdark min-h-screen">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark overflow-hidden">
            <div className="border-b border-stroke py-4 px-4 sm:px-6 dark:border-strokedark">
              <h1 className="font-semibold text-black dark:text-white text-lg sm:text-xl md:text-2xl text-center mb-2">
                TLBC Central Departments
              </h1>
              <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-4">
                Explore our central departments and meet our central leaders
              </p>

              {/* Search Bar */}
              <div className="relative max-w-md mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search departments or leaders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-3 pl-10 pr-4 text-sm text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredDepartments.map((dept, index) => (
                  <div 
                    key={dept.name}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                  >
                    <div className={`${getBgColor(index)} p-4 text-white`}>
                      <h3 className="font-bold text-lg text-center">{dept.name}</h3>
                    </div>
                    
                    <div className="p-4 flex-grow">
                      <div 
                        onClick={() => toggleDepartment(dept.name)}
                        className="flex justify-between items-center cursor-pointer mb-2"
                      >
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Department Executives
                        </span>
                        {expandedDepartments[dept.name] ? 
                          <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        }
                      </div>
                      
                      {expandedDepartments[dept.name] && (
                        <div className="mt-2 space-y-3">
                          {dept.excos.map((exco, i) => (
                            <div 
                              key={i} 
                              className="border border-gray-200 dark:border-gray-700 rounded p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                              onClick={() => handleExcoClick(exco)}
                            >
                              <div className="flex justify-between">
                                <span className="text-xs font-medium text-gray-500">{exco.position}</span>
                              </div>
                              <div className="mt-1 font-medium">{exco.name}</div>
                              <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                                <Phone className="h-3 w-3 mr-1" />
                                <span>{exco.phone}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {!expandedDepartments[dept.name] && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {dept.excos.length} executives, tap to view
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredDepartments.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No departments found</p>
                  <p className="text-gray-500 dark:text-gray-400">Try a different search term</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exco Details Modal */}
      {selectedExco && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full overflow-hidden">
            <div className="bg-blue-600 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold">{selectedExco.position}</h3>
              <button 
                onClick={() => setSelectedExco(null)}
                className="text-white hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5">
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-3">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="font-bold text-lg">{selectedExco.name}</span>
                </div>
                
                <div className="flex items-center mb-3">
                  <Phone className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="text-gray-700 dark:text-gray-300">{selectedExco.phone}</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="text-gray-700 dark:text-gray-300">Birthday: {selectedExco.dob}</span>
                </div>
              </div>
              
              <button
                onClick={() => window.location.href = `tel:${selectedExco.phone}`}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors flex items-center justify-center"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DepartmentsPage;