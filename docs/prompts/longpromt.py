I have a javascript object like this:

{
    "0": {
        "long": {
            "year": {
                "2000": {
                    "valueList": {
                        "0": {
                            "identifyingString": "year: 2000 | sex_name: All | region_name: Asia | sub_region_name: Eastern Asia | location_name: China | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 260536746.32111856,
                                "yll_lower": 223373789.51520514,
                                "yll_upper": 300876051.28005636,
                                "deaths_val": 8653294.950631432,
                                "deaths_lower": 7375503.271804872,
                                "deaths_upper": 10026707.55882581,
                                "identifying_string": "year: 2000 | sex_name: All | region_name: Asia | sub_region_name: Eastern Asia | location_name: China | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "38efef0139805c14170caf5fc594bd4b"
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "2000"
                                },
                                "location_name": "China"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "2000"
                                },
                                "location_name": "China",
                                "region_name": "Asia",
                                "sub_region_name": "Eastern Asia"
                            }
                        },
                        "1": {
                            "identifyingString": "year: 2000 | sex_name: All | region_name: Asia | sub_region_name: Southern Asia | location_name: India | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 405164072.77068186,
                                "yll_lower": 316681768.6921726,
                                "yll_upper": 512635259.56295836,
                                "deaths_val": 8544664.921089424,
                                "deaths_lower": 6669465.156400423,
                                "deaths_upper": 10774140.42938725,
                                "identifying_string": "year: 2000 | sex_name: All | region_name: Asia | sub_region_name: Southern Asia | location_name: India | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "4a5b4f6550af9b2004de3ea64aece437"
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "2000"
                                },
                                "location_name": "India"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "2000"
                                },
                                "location_name": "India",
                                "region_name": "Asia",
                                "sub_region_name": "Southern Asia"
                            }
                        },
                        "2": {
                            "identifyingString": "year: 2000 | sex_name: All | region_name: Europe | sub_region_name: Eastern Europe | location_name: Russian Federation | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 0,
                                "yll_lower": 0,
                                "yll_upper": 0,
                                "deaths_val": 0,
                                "deaths_lower": 0,
                                "deaths_upper": 0
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "2000"
                                },
                                "location_name": "Russian Federation"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "2000"
                                },
                                "location_name": "Russian Federation",
                                "region_name": "Europe",
                                "sub_region_name": "Eastern Europe"
                            }
                        },
                        "3": {
                            "identifyingString": "year: 2000 | sex_name: All | region_name: Americas | sub_region_name: Northern America | location_name: United States of America | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 49119223.847137585,
                                "yll_lower": 45548959.61954583,
                                "yll_upper": 52843632.75036138,
                                "deaths_val": 2388366.6065891893,
                                "deaths_lower": 2117762.1181512773,
                                "deaths_upper": 2666050.9842502074,
                                "identifying_string": "year: 2000 | sex_name: All | region_name: Americas | sub_region_name: Northern America | location_name: United States of America | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "68b7da030577672586b0596c839b559a"
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "2000"
                                },
                                "location_name": "United States of America"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "2000"
                                },
                                "location_name": "United States of America",
                                "region_name": "Americas",
                                "sub_region_name": "Northern America"
                            }
                        }
                    }
                },
                "2005": {
                    "valueList": {
                        "0": {
                            "identifyingString": "year: 2005 | sex_name: All | region_name: Asia | sub_region_name: Eastern Asia | location_name: China | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 0,
                                "yll_lower": 0,
                                "yll_upper": 0,
                                "deaths_val": 0,
                                "deaths_lower": 0,
                                "deaths_upper": 0
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "2005"
                                },
                                "location_name": "China"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "2005"
                                },
                                "location_name": "China",
                                "region_name": "Asia",
                                "sub_region_name": "Eastern Asia"
                            }
                        },
                        "1": {
                            "identifyingString": "year: 2005 | sex_name: All | region_name: Asia | sub_region_name: Southern Asia | location_name: India | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 377247749.0301924,
                                "yll_lower": 299769247.9600569,
                                "yll_upper": 469605248.5359244,
                                "deaths_val": 8411004.426948072,
                                "deaths_lower": 6664538.133377342,
                                "deaths_upper": 10453168.446189685,
                                "identifying_string": "year: 2005 | sex_name: All | region_name: Asia | sub_region_name: Southern Asia | location_name: India | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "5315b26b073c9407db27cd6184a26cbc"
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "2005"
                                },
                                "location_name": "India"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "2005"
                                },
                                "location_name": "India",
                                "region_name": "Asia",
                                "sub_region_name": "Southern Asia"
                            }
                        },
                        "2": {
                            "identifyingString": "year: 2005 | sex_name: All | region_name: Europe | sub_region_name: Eastern Europe | location_name: Russian Federation | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 64489914.618922174,
                                "yll_lower": 61733418.31597448,
                                "yll_upper": 67641302.72093374,
                                "deaths_val": 2349998.398556443,
                                "deaths_lower": 2233479.626723572,
                                "deaths_upper": 2481625.6891850187,
                                "identifying_string": "year: 2005 | sex_name: All | region_name: Europe | sub_region_name: Eastern Europe | location_name: Russian Federation | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "6600e3c7363e3ad9b8b6e969e9fff3d7"
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "2005"
                                },
                                "location_name": "Russian Federation"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "2005"
                                },
                                "location_name": "Russian Federation",
                                "region_name": "Europe",
                                "sub_region_name": "Eastern Europe"
                            }
                        },
                        "3": {
                            "identifyingString": "year: 2005 | sex_name: All | region_name: Americas | sub_region_name: Northern America | location_name: United States of America | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 50459671.81320306,
                                "yll_lower": 46470852.47436126,
                                "yll_upper": 54658452.91205334,
                                "deaths_val": 2442105.5891839135,
                                "deaths_lower": 2134925.645328251,
                                "deaths_upper": 2756424.1397975897,
                                "identifying_string": "year: 2005 | sex_name: All | region_name: Americas | sub_region_name: Northern America | location_name: United States of America | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "e25797eb8b23987ed6ab3564c86e4852"
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "2005"
                                },
                                "location_name": "United States of America"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "2005"
                                },
                                "location_name": "United States of America",
                                "region_name": "Americas",
                                "sub_region_name": "Northern America"
                            }
                        }
                    }
                },
                "2010": {
                    "valueList": {
                        "0": {
                            "identifyingString": "year: 2010 | sex_name: All | region_name: Asia | sub_region_name: Eastern Asia | location_name: China | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 230344965.04767618,
                                "yll_lower": 198127500.30068102,
                                "yll_upper": 265828346.46630293,
                                "deaths_val": 9504937.44896531,
                                "deaths_lower": 8162742.550533743,
                                "deaths_upper": 11022317.71001334,
                                "identifying_string": "year: 2010 | sex_name: All | region_name: Asia | sub_region_name: Eastern Asia | location_name: China | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "7666cbae161c45c7ea75a7ee9995211b"
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "2010"
                                },
                                "location_name": "China"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "2010"
                                },
                                "location_name": "China",
                                "region_name": "Asia",
                                "sub_region_name": "Eastern Asia"
                            }
                        },
                        "1": {
                            "identifyingString": "year: 2010 | sex_name: All | region_name: Asia | sub_region_name: Southern Asia | location_name: India | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 357323916.2312709,
                                "yll_lower": 285261637.0099233,
                                "yll_upper": 442184826.4687505,
                                "deaths_val": 8640665.835880568,
                                "deaths_lower": 6882475.550443531,
                                "deaths_upper": 10699025.838571804,
                                "identifying_string": "year: 2010 | sex_name: All | region_name: Asia | sub_region_name: Southern Asia | location_name: India | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "58563087b4194fa5c90764975afc1511"
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "2010"
                                },
                                "location_name": "India"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "2010"
                                },
                                "location_name": "India",
                                "region_name": "Asia",
                                "sub_region_name": "Southern Asia"
                            }
                        },
                        "2": {
                            "identifyingString": "year: 2010 | sex_name: All | region_name: Europe | sub_region_name: Eastern Europe | location_name: Russian Federation | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 51844464.848822236,
                                "yll_lower": 49812068.12722337,
                                "yll_upper": 54185230.340742975,
                                "deaths_val": 2027960.5479134961,
                                "deaths_lower": 1916285.5425163305,
                                "deaths_upper": 2152948.8810257753,
                                "identifying_string": "year: 2010 | sex_name: All | region_name: Europe | sub_region_name: Eastern Europe | location_name: Russian Federation | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "0a2ab8a8a4eda8abd501047f84f496ef"
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "2010"
                                },
                                "location_name": "Russian Federation"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "2010"
                                },
                                "location_name": "Russian Federation",
                                "region_name": "Europe",
                                "sub_region_name": "Eastern Europe"
                            }
                        },
                        "3": {
                            "identifyingString": "year: 2010 | sex_name: All | region_name: Americas | sub_region_name: Northern America | location_name: United States of America | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 49850359.679713786,
                                "yll_lower": 45622967.638569705,
                                "yll_upper": 54392439.435706794,
                                "deaths_val": 2474653.8557731803,
                                "deaths_lower": 2136415.8968536463,
                                "deaths_upper": 2823864.381612509,
                                "identifying_string": "year: 2010 | sex_name: All | region_name: Americas | sub_region_name: Northern America | location_name: United States of America | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "34066c94c56baab0e049fc251adca4f4"
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "2010"
                                },
                                "location_name": "United States of America"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "2010"
                                },
                                "location_name": "United States of America",
                                "region_name": "Americas",
                                "sub_region_name": "Northern America"
                            }
                        }
                    }
                },
                "2015": {
                    "valueList": {
                        "0": {
                            "identifyingString": "year: 2015 | sex_name: All | region_name: Asia | sub_region_name: Eastern Asia | location_name: China | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 222592098.6846959,
                                "yll_lower": 185183467.4543812,
                                "yll_upper": 266286547.99761257,
                                "deaths_val": 9808092.717614269,
                                "deaths_lower": 8140346.686134522,
                                "deaths_upper": 11806298.75035022,
                                "identifying_string": "year: 2015 | sex_name: All | region_name: Asia | sub_region_name: Eastern Asia | location_name: China | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "ad7113fe89d64e0dde40bf069b1c1681"
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "2015"
                                },
                                "location_name": "China"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "2015"
                                },
                                "location_name": "China",
                                "region_name": "Asia",
                                "sub_region_name": "Eastern Asia"
                            }
                        },
                        "1": {
                            "identifyingString": "year: 2015 | sex_name: All | region_name: Asia | sub_region_name: Southern Asia | location_name: India | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 0,
                                "yll_lower": 0,
                                "yll_upper": 0,
                                "deaths_val": 0,
                                "deaths_lower": 0,
                                "deaths_upper": 0
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "2015"
                                },
                                "location_name": "India"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "2015"
                                },
                                "location_name": "India",
                                "region_name": "Asia",
                                "sub_region_name": "Southern Asia"
                            }
                        },
                        "2": {
                            "identifyingString": "year: 2015 | sex_name: All | region_name: Europe | sub_region_name: Eastern Europe | location_name: Russian Federation | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 44353058.13195018,
                                "yll_lower": 42146104.98346023,
                                "yll_upper": 46821395.43776256,
                                "deaths_val": 1850669.4357021619,
                                "deaths_lower": 1717749.0936987118,
                                "deaths_upper": 1993964.1060142554,
                                "identifying_string": "year: 2015 | sex_name: All | region_name: Europe | sub_region_name: Eastern Europe | location_name: Russian Federation | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "036d2121b5bfd3be2c7b0c28ce7fd9e9"
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "2015"
                                },
                                "location_name": "Russian Federation"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "2015"
                                },
                                "location_name": "Russian Federation",
                                "region_name": "Europe",
                                "sub_region_name": "Eastern Europe"
                            }
                        },
                        "3": {
                            "identifyingString": "year: 2015 | sex_name: All | region_name: Americas | sub_region_name: Northern America | location_name: United States of America | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 54005829.758413866,
                                "yll_lower": 49134438.2086872,
                                "yll_upper": 59239425.78228626,
                                "deaths_val": 2705487.394242723,
                                "deaths_lower": 2323154.201828661,
                                "deaths_upper": 3101348.159174396,
                                "identifying_string": "year: 2015 | sex_name: All | region_name: Americas | sub_region_name: Northern America | location_name: United States of America | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "909afb3b05a841bc23c91cb5a27ce80e"
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "2015"
                                },
                                "location_name": "United States of America"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "2015"
                                },
                                "location_name": "United States of America",
                                "region_name": "Americas",
                                "sub_region_name": "Northern America"
                            }
                        }
                    }
                },
                "2019": {
                    "valueList": {
                        "0": {
                            "identifyingString": "year: 2019 | sex_name: All | region_name: Asia | sub_region_name: Eastern Asia | location_name: China | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 228407693.88097128,
                                "yll_lower": 178719339.72424585,
                                "yll_upper": 289367420.9663958,
                                "deaths_val": 10653448.03142617,
                                "deaths_lower": 8349300.2482043,
                                "deaths_upper": 13515289.409108067,
                                "identifying_string": "year: 2019 | sex_name: All | region_name: Asia | sub_region_name: Eastern Asia | location_name: China | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "0fdf2d928e0822bfcc9da738ac15d0bf"
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "2019"
                                },
                                "location_name": "China"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "2019"
                                },
                                "location_name": "China",
                                "region_name": "Asia",
                                "sub_region_name": "Eastern Asia"
                            }
                        },
                        "1": {
                            "identifyingString": "year: 2019 | sex_name: All | region_name: Asia | sub_region_name: Southern Asia | location_name: India | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 308152385.3717885,
                                "yll_lower": 229219677.37323567,
                                "yll_upper": 406709770.99698144,
                                "deaths_val": 9391548.568553228,
                                "deaths_lower": 6925719.987318845,
                                "deaths_upper": 12458752.67618893,
                                "identifying_string": "year: 2019 | sex_name: All | region_name: Asia | sub_region_name: Southern Asia | location_name: India | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "03af8c51591dfa13eb3f6397eeb14c93"
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "2019"
                                },
                                "location_name": "India"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "2019"
                                },
                                "location_name": "India",
                                "region_name": "Asia",
                                "sub_region_name": "Southern Asia"
                            }
                        },
                        "2": {
                            "identifyingString": "year: 2019 | sex_name: All | region_name: Europe | sub_region_name: Eastern Europe | location_name: Russian Federation | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 40921212.82631156,
                                "yll_lower": 33262294.967185162,
                                "yll_upper": 49977722.482910536,
                                "deaths_val": 1788286.2644205454,
                                "deaths_lower": 1444622.798695265,
                                "deaths_upper": 2192987.6793363965,
                                "identifying_string": "year: 2019 | sex_name: All | region_name: Europe | sub_region_name: Eastern Europe | location_name: Russian Federation | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "d5471619b728587a1acaf2067736f1b0"
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "2019"
                                },
                                "location_name": "Russian Federation"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "2019"
                                },
                                "location_name": "Russian Federation",
                                "region_name": "Europe",
                                "sub_region_name": "Eastern Europe"
                            }
                        },
                        "3": {
                            "identifyingString": "year: 2019 | sex_name: All | region_name: Americas | sub_region_name: Northern America | location_name: United States of America | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 57757642.010042675,
                                "yll_lower": 52019985.337710805,
                                "yll_upper": 63816196.72758803,
                                "deaths_val": 2946455.755227674,
                                "deaths_lower": 2518950.007938748,
                                "deaths_upper": 3392475.246474771,
                                "identifying_string": "year: 2019 | sex_name: All | region_name: Americas | sub_region_name: Northern America | location_name: United States of America | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "987b99ef8b1e99bf8e38d347b48159eb"
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "2019"
                                },
                                "location_name": "United States of America"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "2019"
                                },
                                "location_name": "United States of America",
                                "region_name": "Americas",
                                "sub_region_name": "Northern America"
                            }
                        }
                    }
                },
                "All": {
                    "valueList": {
                        "0": {
                            "identifyingString": "year: All | sex_name: All | region_name: Asia | sub_region_name: Eastern Asia | location_name: China | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 1185306995.4721513,
                                "yll_lower": 996988342.77461,
                                "yll_upper": 1400575582.8452628,
                                "deaths_val": 47835675.30560951,
                                "deaths_lower": 40006288.08268205,
                                "deaths_upper": 56949476.990460455,
                                "identifying_string": "year: All | sex_name: All | region_name: Asia | sub_region_name: Eastern Asia | location_name: China | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "6702bc1059ed2a32fb56de4b6856a3f0"
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "All"
                                },
                                "location_name": "China"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "All"
                                },
                                "location_name": "China",
                                "region_name": "Asia",
                                "sub_region_name": "Eastern Asia"
                            }
                        },
                        "1": {
                            "identifyingString": "year: All | sex_name: All | region_name: Asia | sub_region_name: Southern Asia | location_name: India | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 1771508524.5385861,
                                "yll_lower": 1388022266.32637,
                                "yll_upper": 2232865860.4003615,
                                "deaths_val": 43957676.98571702,
                                "deaths_lower": 34231522.056482255,
                                "deaths_upper": 55559760.13603652,
                                "identifying_string": "year: All | sex_name: All | region_name: Asia | sub_region_name: Southern Asia | location_name: India | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "e238e43e377bf63e7996af7a3688cfbe"
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "All"
                                },
                                "location_name": "India"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "All"
                                },
                                "location_name": "India",
                                "region_name": "Asia",
                                "sub_region_name": "Southern Asia"
                            }
                        },
                        "2": {
                            "identifyingString": "year: All | sex_name: All | region_name: Europe | sub_region_name: Eastern Europe | location_name: Russian Federation | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 261399545.45470154,
                                "yll_lower": 244660229.77241537,
                                "yll_upper": 280613140.3199745,
                                "deaths_val": 10224632.921200985,
                                "deaths_lower": 9420820.160463614,
                                "deaths_upper": 11132702.84675076,
                                "identifying_string": "year: All | sex_name: All | region_name: Europe | sub_region_name: Eastern Europe | location_name: Russian Federation | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "a71981ad4ac932753052a9ac736cc38d"
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "All"
                                },
                                "location_name": "Russian Federation"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "All"
                                },
                                "location_name": "Russian Federation",
                                "region_name": "Europe",
                                "sub_region_name": "Eastern Europe"
                            }
                        },
                        "3": {
                            "identifyingString": "year: All | sex_name: All | region_name: Americas | sub_region_name: Northern America | location_name: United States of America | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 261192727.1085111,
                                "yll_lower": 238797203.278875,
                                "yll_upper": 284950147.60799545,
                                "deaths_val": 12957069.201016685,
                                "deaths_lower": 11231207.870100556,
                                "deaths_upper": 14740162.911309464,
                                "identifying_string": "year: All | sex_name: All | region_name: Americas | sub_region_name: Northern America | location_name: United States of America | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "eddaa18c7df63c6f76af55fab5f6cd65"
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "All"
                                },
                                "location_name": "United States of America"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "All"
                                },
                                "location_name": "United States of America",
                                "region_name": "Americas",
                                "sub_region_name": "Northern America"
                            }
                        }
                    }
                }
            },
            "sex_name": {
                "female": {
                    "valueList": {
                        "0": {
                            "identifyingString": "year: 2000 | sex_name: female | region_name: Asia | sub_region_name: Eastern Asia | location_name: China | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 106416100.23054169,
                                "yll_lower": 90452789.03039476,
                                "yll_upper": 123702774.79668811,
                                "deaths_val": 3742498.0826088414,
                                "deaths_lower": 3119564.4033034863,
                                "deaths_upper": 4406665.903075974,
                                "identifying_string": "year: 2000 | sex_name: female | region_name: Asia | sub_region_name: Eastern Asia | location_name: China | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "9e1ee1b109a0e82f75cb0fe798a0de6e"
                            },
                            "identifiyingDict": {
                                "year": "2000",
                                "location_name": "China",
                                "sex_name": {
                                    "0": "female"
                                }
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": "2000",
                                "location_name": "China",
                                "sex_name": {
                                    "0": "female"
                                },
                                "region_name": "Asia",
                                "sub_region_name": "Eastern Asia"
                            }
                        },
                        "1": {
                            "identifyingString": "year: 2000 | sex_name: female | region_name: Asia | sub_region_name: Southern Asia | location_name: India | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 191146605.04622123,
                                "yll_lower": 145530772.77934954,
                                "yll_upper": 245882560.8252373,
                                "deaths_val": 3935875.473290103,
                                "deaths_lower": 2948181.770762853,
                                "deaths_upper": 5083842.5853063045,
                                "identifying_string": "year: 2000 | sex_name: female | region_name: Asia | sub_region_name: Southern Asia | location_name: India | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "915a6da3d6531dc5e3643fe07b78356a"
                            },
                            "identifiyingDict": {
                                "year": "2000",
                                "location_name": "India",
                                "sex_name": {
                                    "0": "female"
                                }
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": "2000",
                                "location_name": "India",
                                "sex_name": {
                                    "0": "female"
                                },
                                "region_name": "Asia",
                                "sub_region_name": "Southern Asia"
                            }
                        },
                        "2": {
                            "identifyingString": "year: 2000 | sex_name: female | region_name: Europe | sub_region_name: Eastern Europe | location_name: Russian Federation | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 21700492.754555937,
                                "yll_lower": 20600744.458772987,
                                "yll_upper": 22818387.96630002,
                                "deaths_val": 1032240.2314881455,
                                "deaths_lower": 964485.828159369,
                                "deaths_upper": 1100823.2355436285,
                                "identifying_string": "year: 2000 | sex_name: female | region_name: Europe | sub_region_name: Eastern Europe | location_name: Russian Federation | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "4d485dfd5f865a474b6a6e40d70cb402"
                            },
                            "identifiyingDict": {
                                "year": "2000",
                                "location_name": "Russian Federation",
                                "sex_name": {
                                    "0": "female"
                                }
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": "2000",
                                "location_name": "Russian Federation",
                                "sex_name": {
                                    "0": "female"
                                },
                                "region_name": "Europe",
                                "sub_region_name": "Eastern Europe"
                            }
                        },
                        "3": {
                            "identifyingString": "year: 2000 | sex_name: female | region_name: Americas | sub_region_name: Northern America | location_name: United States of America | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 21582378.40945899,
                                "yll_lower": 19395304.979129795,
                                "yll_upper": 23744889.25493974,
                                "deaths_val": 1216834.7615322534,
                                "deaths_lower": 1029269.9733648066,
                                "deaths_upper": 1402033.8582011552,
                                "identifying_string": "year: 2000 | sex_name: female | region_name: Americas | sub_region_name: Northern America | location_name: United States of America | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "491f0a521eae1b101514dd05ab97c9ad"
                            },
                            "identifiyingDict": {
                                "year": "2000",
                                "location_name": "United States of America",
                                "sex_name": {
                                    "0": "female"
                                }
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": "2000",
                                "location_name": "United States of America",
                                "sex_name": {
                                    "0": "female"
                                },
                                "region_name": "Americas",
                                "sub_region_name": "Northern America"
                            }
                        }
                    }
                },
                "male": {
                    "valueList": {
                        "0": {
                            "identifyingString": "year: 2000 | sex_name: male | region_name: Asia | sub_region_name: Eastern Asia | location_name: China | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 154120646.09057695,
                                "yll_lower": 132921000.4848103,
                                "yll_upper": 177173276.4833687,
                                "deaths_val": 4910796.8680225955,
                                "deaths_lower": 4255938.868501391,
                                "deaths_upper": 5620041.655749824,
                                "identifying_string": "year: 2000 | sex_name: male | region_name: Asia | sub_region_name: Eastern Asia | location_name: China | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "5096ca3ebf11eb320102f2698fde538e"
                            },
                            "identifiyingDict": {
                                "year": "2000",
                                "location_name": "China",
                                "sex_name": {
                                    "0": "male"
                                }
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": "2000",
                                "location_name": "China",
                                "sex_name": {
                                    "0": "male"
                                },
                                "region_name": "Asia",
                                "sub_region_name": "Eastern Asia"
                            }
                        },
                        "1": {
                            "identifyingString": "year: 2000 | sex_name: male | region_name: Asia | sub_region_name: Southern Asia | location_name: India | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 214017467.72446057,
                                "yll_lower": 171150995.91282365,
                                "yll_upper": 266752698.737721,
                                "deaths_val": 4608789.447799312,
                                "deaths_lower": 3721283.3856375744,
                                "deaths_upper": 5690297.844080941,
                                "identifying_string": "year: 2000 | sex_name: male | region_name: Asia | sub_region_name: Southern Asia | location_name: India | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "79f5e605bf1b8d4967e9d8cb9ee4b751"
                            },
                            "identifiyingDict": {
                                "year": "2000",
                                "location_name": "India",
                                "sex_name": {
                                    "0": "male"
                                }
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": "2000",
                                "location_name": "India",
                                "sex_name": {
                                    "0": "male"
                                },
                                "region_name": "Asia",
                                "sub_region_name": "Southern Asia"
                            }
                        },
                        "2": {
                            "identifyingString": "year: 2000 | sex_name: male | region_name: Europe | sub_region_name: Eastern Europe | location_name: Russian Federation | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 0,
                                "yll_lower": 0,
                                "yll_upper": 0,
                                "deaths_val": 0,
                                "deaths_lower": 0,
                                "deaths_upper": 0
                            },
                            "identifiyingDict": {
                                "year": "2000",
                                "location_name": "Russian Federation",
                                "sex_name": {
                                    "0": "male"
                                }
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": "2000",
                                "location_name": "Russian Federation",
                                "sex_name": {
                                    "0": "male"
                                },
                                "region_name": "Europe",
                                "sub_region_name": "Eastern Europe"
                            }
                        },
                        "3": {
                            "identifyingString": "year: 2000 | sex_name: male | region_name: Americas | sub_region_name: Northern America | location_name: United States of America | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 27536845.437678605,
                                "yll_lower": 26153654.640416026,
                                "yll_upper": 29098743.49542161,
                                "deaths_val": 1171531.845056939,
                                "deaths_lower": 1088492.144786471,
                                "deaths_upper": 1264017.1260490527,
                                "identifying_string": "year: 2000 | sex_name: male | region_name: Americas | sub_region_name: Northern America | location_name: United States of America | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "89c0db35a6bef691daeda41604e5dc3b"
                            },
                            "identifiyingDict": {
                                "year": "2000",
                                "location_name": "United States of America",
                                "sex_name": {
                                    "0": "male"
                                }
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": "2000",
                                "location_name": "United States of America",
                                "sex_name": {
                                    "0": "male"
                                },
                                "region_name": "Americas",
                                "sub_region_name": "Northern America"
                            }
                        }
                    }
                },
                "All": {
                    "valueList": {
                        "0": {
                            "identifyingString": "year: 2000 | sex_name: All | region_name: Asia | sub_region_name: Eastern Asia | location_name: China | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 260536746.32111856,
                                "yll_lower": 223373789.51520514,
                                "yll_upper": 300876051.28005636,
                                "deaths_val": 8653294.950631432,
                                "deaths_lower": 7375503.271804872,
                                "deaths_upper": 10026707.55882581,
                                "identifying_string": "year: 2000 | sex_name: All | region_name: Asia | sub_region_name: Eastern Asia | location_name: China | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "38efef0139805c14170caf5fc594bd4b"
                            },
                            "identifiyingDict": {
                                "year": "2000",
                                "location_name": "China",
                                "sex_name": {
                                    "0": "All"
                                }
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": "2000",
                                "location_name": "China",
                                "sex_name": {
                                    "0": "All"
                                },
                                "region_name": "Asia",
                                "sub_region_name": "Eastern Asia"
                            }
                        },
                        "1": {
                            "identifyingString": "year: 2000 | sex_name: All | region_name: Asia | sub_region_name: Southern Asia | location_name: India | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 405164072.77068186,
                                "yll_lower": 316681768.6921726,
                                "yll_upper": 512635259.56295836,
                                "deaths_val": 8544664.921089424,
                                "deaths_lower": 6669465.156400423,
                                "deaths_upper": 10774140.42938725,
                                "identifying_string": "year: 2000 | sex_name: All | region_name: Asia | sub_region_name: Southern Asia | location_name: India | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "4a5b4f6550af9b2004de3ea64aece437"
                            },
                            "identifiyingDict": {
                                "year": "2000",
                                "location_name": "India",
                                "sex_name": {
                                    "0": "All"
                                }
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": "2000",
                                "location_name": "India",
                                "sex_name": {
                                    "0": "All"
                                },
                                "region_name": "Asia",
                                "sub_region_name": "Southern Asia"
                            }
                        },
                        "2": {
                            "identifyingString": "year: 2000 | sex_name: All | region_name: Europe | sub_region_name: Eastern Europe | location_name: Russian Federation | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 0,
                                "yll_lower": 0,
                                "yll_upper": 0,
                                "deaths_val": 0,
                                "deaths_lower": 0,
                                "deaths_upper": 0
                            },
                            "identifiyingDict": {
                                "year": "2000",
                                "location_name": "Russian Federation",
                                "sex_name": {
                                    "0": "All"
                                }
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": "2000",
                                "location_name": "Russian Federation",
                                "sex_name": {
                                    "0": "All"
                                },
                                "region_name": "Europe",
                                "sub_region_name": "Eastern Europe"
                            }
                        },
                        "3": {
                            "identifyingString": "year: 2000 | sex_name: All | region_name: Americas | sub_region_name: Northern America | location_name: United States of America | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 49119223.847137585,
                                "yll_lower": 45548959.61954583,
                                "yll_upper": 52843632.75036138,
                                "deaths_val": 2388366.6065891893,
                                "deaths_lower": 2117762.1181512773,
                                "deaths_upper": 2666050.9842502074,
                                "identifying_string": "year: 2000 | sex_name: All | region_name: Americas | sub_region_name: Northern America | location_name: United States of America | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "68b7da030577672586b0596c839b559a"
                            },
                            "identifiyingDict": {
                                "year": "2000",
                                "location_name": "United States of America",
                                "sex_name": {
                                    "0": "All"
                                }
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": "2000",
                                "location_name": "United States of America",
                                "sex_name": {
                                    "0": "All"
                                },
                                "region_name": "Americas",
                                "sub_region_name": "Northern America"
                            }
                        }
                    }
                }
            },
            "region_name": {
                "Africa": {
                    "valueList": {
                        "0": {
                            "identifyingString": "year: 2000 | sex_name: All | region_name: Africa | sub_region_name: Eastern Asia | location_name: China | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 0,
                                "yll_lower": 0,
                                "yll_upper": 0,
                                "deaths_val": 0,
                                "deaths_lower": 0,
                                "deaths_upper": 0
                            },
                            "identifiyingDict": {
                                "year": "2000",
                                "location_name": "China",
                                "region_name": {
                                    "0": "Africa"
                                }
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": "2000",
                                "location_name": "China",
                                "region_name": {
                                    "0": "Africa"
                                },
                                "sub_region_name": "Eastern Asia"
                            }
                        },
                        "1": {
                            "identifyingString": "year: 2000 | sex_name: All | region_name: Africa | sub_region_name: Southern Asia | location_name: India | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 0,
                                "yll_lower": 0,
                                "yll_upper": 0,
                                "deaths_val": 0,
                                "deaths_lower": 0,
                                "deaths_upper": 0
                            },
                            "identifiyingDict": {
                                "year": "2000",
                                "location_name": "India",
                                "region_name": {
                                    "0": "Africa"
                                }
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": "2000",
                                "location_name": "India",
                                "region_name": {
                                    "0": "Africa"
                                },
                                "sub_region_name": "Southern Asia"
                            }
                        },
                        "2": {
                            "identifyingString": "year: 2000 | sex_name: All | region_name: Africa | sub_region_name: Eastern Europe | location_name: Russian Federation | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 0,
                                "yll_lower": 0,
                                "yll_upper": 0,
                                "deaths_val": 0,
                                "deaths_lower": 0,
                                "deaths_upper": 0
                            },
                            "identifiyingDict": {
                                "year": "2000",
                                "location_name": "Russian Federation",
                                "region_name": {
                                    "0": "Africa"
                                }
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": "2000",
                                "location_name": "Russian Federation",
                                "region_name": {
                                    "0": "Africa"
                                },
                                "sub_region_name": "Eastern Europe"
                            }
                        },
                        "3": {
                            "identifyingString": "year: 2000 | sex_name: All | region_name: Africa | sub_region_name: Northern America | location_name: United States of America | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 0,
                                "yll_lower": 0,
                                "yll_upper": 0,
                                "deaths_val": 0,
                                "deaths_lower": 0,
                                "deaths_upper": 0
                            },
                            "identifiyingDict": {
                                "year": "2000",
                                "location_name": "United States of America",
                                "region_name": {
                                    "0": "Africa"
                                }
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": "2000",
                                "location_name": "United States of America",
                                "region_name": {
                                    "0": "Africa"
                                },
                                "sub_region_name": "Northern America"
                            }
                        }
...

                    }
                }
            }
        }
    }
}


AS you can see there a lot of dict of dicts and then a list an din that list there is a "cachedData" dictionary

I would like you to write a javascript function similar in overall design to this function:

function addDataToTree(hashTree, cachedHashes, hashName) {
    if (typeof hashTree !== 'object' || hashTree === null) return hashTree;
    const result = {};
    for (const key in hashTree) {
        if (key === hashName) {
            result["cachedData"] = cachedHashes[hashTree[key]];
        } else if (typeof hashTree[key] === 'object' && hashTree[key] !== null) {
            result[key] = addDataToTree(hashTree[key], cachedHashes, hashName);
        } else {
            result[key] = hashTree[key];
        }
    }
    return result;
}

that itterates throught the dicts of dicts until it finnds the list then and then aggregates a seleciton of values 
in "cachedData" in that list by using a given aggregation function so far only implement sum but design for more.


So the function should look like this:


function aggregateValuesInTree(valueTree, aggDict, valueName, aggName) {

}

and in this case it would be called like this:

aggregateValuesInTree(valueTree, {
    "yll_val": "sum"
    "yll_lower": "sum"
    "yll_upper": "sum"
    "deaths_val": "sum"
    "deaths_lower": "sum"
    "deaths_upper": "sum"
}, "cachedData", "aggregatedData")


It should return a dict like this which is the original dict with aggregatedData added at the right place:



{
    "0": {
        "long": {
            "year": {
                "2000": {
                    "aggregatedData":{
                      "yll_val": 714820042.938938,
                      "yll_lower": 585604517.8269236,
                      "yll_upper": 866354943.5933761,
                      "deaths_val": 19586326.478310043,
                      "deaths_lower": 16162730.54635657,
                      "deaths_upper": 23466898.97246306
                    },
                    "valueList": {
                        "0": {
                            "identifyingString": "year: 2000 | sex_name: All | region_name: Asia | sub_region_name: Eastern Asia | location_name: China | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 260536746.32111856,
                                "yll_lower": 223373789.51520514,
                                "yll_upper": 300876051.28005636,
                                "deaths_val": 8653294.950631432,
                                "deaths_lower": 7375503.271804872,
                                "deaths_upper": 10026707.55882581,
                                "identifying_string": "year: 2000 | sex_name: All | region_name: Asia | sub_region_name: Eastern Asia | location_name: China | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "38efef0139805c14170caf5fc594bd4b"
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "2000"
                                },
                                "location_name": "China"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "2000"
                                },
                                "location_name": "China",
                                "region_name": "Asia",
                                "sub_region_name": "Eastern Asia"
                            }
                        },
                        "1": {
                            "identifyingString": "year: 2000 | sex_name: All | region_name: Asia | sub_region_name: Southern Asia | location_name: India | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 405164072.77068186,
                                "yll_lower": 316681768.6921726,
                                "yll_upper": 512635259.56295836,
                                "deaths_val": 8544664.921089424,
                                "deaths_lower": 6669465.156400423,
                                "deaths_upper": 10774140.42938725,
                                "identifying_string": "year: 2000 | sex_name: All | region_name: Asia | sub_region_name: Southern Asia | location_name: India | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "4a5b4f6550af9b2004de3ea64aece437"
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "2000"
                                },
                                "location_name": "India"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "2000"
                                },
                                "location_name": "India",
                                "region_name": "Asia",
                                "sub_region_name": "Southern Asia"
                            }
                        },
                        "2": {
                            "identifyingString": "year: 2000 | sex_name: All | region_name: Europe | sub_region_name: Eastern Europe | location_name: Russian Federation | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 0,
                                "yll_lower": 0,
                                "yll_upper": 0,
                                "deaths_val": 0,
                                "deaths_lower": 0,
                                "deaths_upper": 0
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "2000"
                                },
                                "location_name": "Russian Federation"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "2000"
                                },
                                "location_name": "Russian Federation",
                                "region_name": "Europe",
                                "sub_region_name": "Eastern Europe"
                            }
                        },
                        "3": {
                            "identifyingString": "year: 2000 | sex_name: All | region_name: Americas | sub_region_name: Northern America | location_name: United States of America | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                            "cachedData": {
                                "yll_val": 49119223.847137585,
                                "yll_lower": 45548959.61954583,
                                "yll_upper": 52843632.75036138,
                                "deaths_val": 2388366.6065891893,
                                "deaths_lower": 2117762.1181512773,
                                "deaths_upper": 2666050.9842502074,
                                "identifying_string": "year: 2000 | sex_name: All | region_name: Americas | sub_region_name: Northern America | location_name: United States of America | age_cluster_name_sorted: All | age_group_name_sorted: All | l1_cause_name: All | l2_cause_name: All",
                                "hash": "68b7da030577672586b0596c839b559a"
                            },
                            "identifiyingDict": {
                                "year": {
                                    "0": "2000"
                                },
                                "location_name": "United States of America"
                            },
                            "identifiyingDictRollupEnriched": {
                                "year": {
                                    "0": "2000"
                                },
                                "location_name": "United States of America",
                                "region_name": "Americas",
                                "sub_region_name": "Northern America"
                            }
                        }
                    }
                },