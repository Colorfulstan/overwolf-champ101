var testDataJSON = {
    "blue": [{
        "summonerSpells": {
            "0": {
                "name": "Smite",
                "description": "Deals 390-1000 true damage (depending on champion level) to target epic or large monster or enemy minion.",
                "cooldown": [90],
                "range": [500],
                "image": {
                    "full": "SummonerSmite.png",
                    "sprite": "spell0.png",
                    "group": "spell",
                    "x": 96,
                    "y": 48,
                    "w": 48,
                    "h": 48
                }
            },
            "1": {
                "name": "Flash",
                "description": "Teleports your champion a short distance toward your cursor's location.",
                "cooldown": [300],
                "range": [425],
                "image": {
                    "full": "SummonerFlash.png",
                    "sprite": "spell0.png",
                    "group": "spell",
                    "x": 240,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            }
        },
        "champ": {
            "name": "Kayle",
            "title": "The Judicator",
            "image": {
                "full": "Kayle.png",
                "sprite": "champion1.png",
                "group": "champion",
                "x": 240,
                "y": 48,
                "w": 48,
                "h": 48
            },
            "allytips": ["Using Intervention on a high-DPS ally can turn the tides of battle by giving your ally free reign to attack. ", "Kayle can effectively do large amounts of damage or support her allies depending on her item build. ", "Kayle benefits greatly from Attack Damage and Ability Power, making hybrid items like Nashor's Tooth and Trinity Force very effective on her. ", "If you wish to support your allies, items like Locket of the Iron Solari can help you assist teammates."],
            "enemytips": ["Intervention only grants Kayle or her allies immunity to damage. Slows and stuns can still be applied, so trap them if they're being overzealous.", "Kayle is usually a fragile target. If you see her ultimate cast on an ally, switch to attacking her.", "Be sure to look at what items Kayle is building to determine what role she is fulfilling on her team."],
            "spells": [{
                "name": "Reckoning",
                "description": "Blasts an enemy unit with angelic force, dealing damage, slowing Movement Speed, and applying Holy Fervor.",
                "image": {
                    "full": "JudicatorReckoning.png",
                    "sprite": "spell5.png",
                    "group": "spell",
                    "x": 432,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Divine Blessing",
                "description": "Blesses a target friendly champion, granting them increased Movement Speed and healing them.",
                "image": {
                    "full": "JudicatorDivineBlessing.png",
                    "sprite": "spell5.png",
                    "group": "spell",
                    "x": 0,
                    "y": 48,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Righteous Fury",
                "description": "Passive: Grants Kayle on Hit magic Damage.  Activate: Ignite Kayle's sword with a holy flame, granting Kayle a ranged splash attack and bonus magic damage.",
                "image": {
                    "full": "JudicatorRighteousFury.png",
                    "sprite": "spell5.png",
                    "group": "spell",
                    "x": 48,
                    "y": 48,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Intervention",
                "description": "Shields Kayle or an ally for a short time, causing them to be immune to damage.",
                "image": {
                    "full": "JudicatorIntervention.png",
                    "sprite": "spell5.png",
                    "group": "spell",
                    "x": 96,
                    "y": 48,
                    "w": 48,
                    "h": 48
                }
            }],
            "passive": {
                "name": "Holy Fervor",
                "description": "When Kayle attacks a champion, the target loses 3% Armor and Magic Resistance for 5 seconds. This effect stacks up to 5 times.",
                "image": {
                    "full": "Kayle_Passive.png",
                    "sprite": "passive1.png",
                    "group": "passive",
                    "x": 240,
                    "y": 48,
                    "w": 48,
                    "h": 48
                }
            }
        }
    }, {
        "summonerSpells": {
            "0": {
                "name": "Flash",
                "description": "Teleports your champion a short distance toward your cursor's location.",
                "cooldown": [300],
                "range": [425],
                "image": {
                    "full": "SummonerFlash.png",
                    "sprite": "spell0.png",
                    "group": "spell",
                    "x": 240,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            },
            "1": {
                "name": "Teleport",
                "description": "After channeling for 3.5 seconds, teleports your champion to target allied structure, minion, or ward.",
                "cooldown": [300],
                "range": [25000],
                "image": {
                    "full": "SummonerTeleport.png",
                    "sprite": "spell0.png",
                    "group": "spell",
                    "x": 144,
                    "y": 48,
                    "w": 48,
                    "h": 48
                }
            }
        },
        "champ": {
            "name": "Renekton",
            "title": "the Butcher of the Sands",
            "image": {
                "full": "Renekton.png",
                "sprite": "champion2.png",
                "group": "champion",
                "x": 336,
                "y": 48,
                "w": 48,
                "h": 48
            },
            "allytips": ["Slice and Dice excels at harassing maneuvers. Slice in, follow up with another skill and then Dice back out to safety.", "Cull the Meek drains an enormous amount of life when used in the middle of the fray. You can use this to bait opponents into thinking you are weaker than you really are.", "Cooldown reduction is especially good for Renekton, allowing him to both quickly build up and use his Fury."],
            "enemytips": ["Pay close attention to Renekton's Fury gauge as that will usually signify when he is about to attack.", "Keeping Renekton from being able to fight and gain Fury by continually harassing him will severely reduce the effectiveness of his abilities."],
            "spells": [{
                "name": "Cull the Meek",
                "description": "Renekton swings his blade, dealing moderate physical damage to all targets around him, and heals for a small portion of the damage dealt. If he has more than 50 Fury, his damage and heal are increased.",
                "image": {
                    "full": "RenektonCleave.png",
                    "sprite": "spell8.png",
                    "group": "spell",
                    "x": 288,
                    "y": 144,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Ruthless Predator",
                "description": "Renekton slashes his target twice, dealing moderate physical damage and stuns them for 0.75 seconds. If Renekton has more than 50 Fury, he slashes his target three times, dealing high physical damage and stuns them for 1.5 seconds.",
                "image": {
                    "full": "RenektonPreExecute.png",
                    "sprite": "spell8.png",
                    "group": "spell",
                    "x": 336,
                    "y": 144,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Slice and Dice",
                "description": "Renekton dashes, dealing damage to units along the way. Empowered, Renekton deals bonus damage and reduces the Armor of units hit.",
                "image": {
                    "full": "RenektonSliceAndDice.png",
                    "sprite": "spell8.png",
                    "group": "spell",
                    "x": 384,
                    "y": 144,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Dominus",
                "description": "Renekton transforms into the Tyrant form, gaining bonus Health and dealing damage to enemies around him. While in this form, Renekton gains Fury periodically.",
                "image": {
                    "full": "RenektonReignOfTheTyrant.png",
                    "sprite": "spell9.png",
                    "group": "spell",
                    "x": 0,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            }],
            "passive": {
                "name": "Reign of Anger",
                "description": "Renekton gains Fury for every autoattack he makes. This Fury can empower his abilities with bonus effects. Additionally, Renekton gains bonus Fury when he is low on life.",
                "image": {
                    "full": "Renekton_Predator.png",
                    "sprite": "passive2.png",
                    "group": "passive",
                    "x": 336,
                    "y": 48,
                    "w": 48,
                    "h": 48
                }
            }
        }
    }, {
        "summonerSpells": {
            "0": {
                "name": "Flash",
                "description": "Teleports your champion a short distance toward your cursor's location.",
                "cooldown": [300],
                "range": [425],
                "image": {
                    "full": "SummonerFlash.png",
                    "sprite": "spell0.png",
                    "group": "spell",
                    "x": 240,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            },
            "1": {
                "name": "Exhaust",
                "description": "Exhausts target enemy champion, reducing their Movement Speed and Attack Speed by 30%, their Armor and Magic Resist by 10, and their damage dealt by 40% for 2.5 seconds.",
                "cooldown": [210],
                "range": [650],
                "image": {
                    "full": "SummonerExhaust.png",
                    "sprite": "spell0.png",
                    "group": "spell",
                    "x": 192,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            }
        },
        "champ": {
            "name": "Braum",
            "title": "the Heart of the Freljord",
            "image": {
                "full": "Braum.png",
                "sprite": "champion0.png",
                "group": "champion",
                "x": 48,
                "y": 48,
                "w": 48,
                "h": 48
            },
            "allytips": ["Work with your allies to stack Concussive Blows, encourage them to basic attack marked targets.", "Leap in front of squishy friends and shield them from projectiles with Unbreakable.", "Glacial Fissure leaves a powerful slow zone, position it well to split teamfights and slow the enemy approach."],
            "enemytips": ["Braum must land Winter's Bite or a basic attack to start Concussive Blows. If you get marked, exit combat range before getting hit 3 more times to avoid the stun.", "Braum's ultimate has a long cast time, use that extra time to dodge. Walking over the frozen ground left behind will slow you, position so that you don't need to cross it.", "Unbreakable gives Braum extremely strong directional defense, either wait until it is down or outposition the ability."],
            "spells": [{
                "name": "Winter's Bite",
                "description": "Braum propels freezing ice from his shield, slowing and dealing magic damage.<br><br>Applies a stack of <span class=\"colorFFF673\">Concussive Blows</span>.",
                "image": {
                    "full": "BraumQ.png",
                    "sprite": "spell1.png",
                    "group": "spell",
                    "x": 432,
                    "y": 48,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Stand Behind Me",
                "description": "Braum leaps to a target allied champion or minion. On arrival, Braum and the ally gain Armor and Magic Resist for a few seconds.",
                "image": {
                    "full": "BraumW.png",
                    "sprite": "spell1.png",
                    "group": "spell",
                    "x": 0,
                    "y": 96,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Unbreakable",
                "description": "Braum raises his shield in a direction for several seconds, intercepting all projectiles causing them to hit him and be destroyed. He negates the damage of the first attack completely and reduces the damage of all subsequent attacks from this direction.",
                "image": {
                    "full": "BraumE.png",
                    "sprite": "spell1.png",
                    "group": "spell",
                    "x": 48,
                    "y": 96,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Glacial Fissure",
                "description": "Braum slams the ground, knocking up enemies nearby and in a line in front of him. A fissure is left along the line that slows enemies.",
                "image": {
                    "full": "BraumRWrapper.png",
                    "sprite": "spell1.png",
                    "group": "spell",
                    "x": 96,
                    "y": 96,
                    "w": 48,
                    "h": 48
                }
            }],
            "passive": {
                "name": "Concussive Blows",
                "description": "Braum adds stacks of Concussive Blows to enemies with basic attacks or Winter's Bite. He and his allies continue to add stacks with basic attacks, at 4 stacks their target will be stunned.",
                "image": {
                    "full": "Braum_Passive.png",
                    "sprite": "passive0.png",
                    "group": "passive",
                    "x": 48,
                    "y": 48,
                    "w": 48,
                    "h": 48
                }
            }
        }
    }, {
        "summonerSpells": {
            "0": {
                "name": "Barrier",
                "description": "Shields your champion for 115-455 (depending on champion level) for 2 seconds.",
                "cooldown": [210],
                "range": "self",
                "image": {
                    "full": "SummonerBarrier.png",
                    "sprite": "spell0.png",
                    "group": "spell",
                    "x": 0,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            },
            "1": {
                "name": "Flash",
                "description": "Teleports your champion a short distance toward your cursor's location.",
                "cooldown": [300],
                "range": [425],
                "image": {
                    "full": "SummonerFlash.png",
                    "sprite": "spell0.png",
                    "group": "spell",
                    "x": 240,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            }
        },
        "champ": {
            "name": "Ahri",
            "title": "the Nine-Tailed Fox",
            "image": {
                "full": "Ahri.png",
                "sprite": "champion0.png",
                "group": "champion",
                "x": 48,
                "y": 0,
                "w": 48,
                "h": 48
            },
            "allytips": ["Use Charm to set up your combos, it will make landing Orb of Deception and Fox-Fire dramatically easier.", "Initiate team fights using Charm, and chase down stragglers with Spirit Rush.", "Spirit Rush enables Ahri's abilities, it opens up paths for Charm, helps double hitting with Orb of Deception, and closes to make use of Fox-Fire."],
            "enemytips": ["Ahri's survivability is dramatically reduced when her Ultimate, Spirit Rush, is down.", "Stay behind minions to make Charm difficult to land, this will reduce Ahri's damage potential significantly."],
            "spells": [{
                "name": "Orb of Deception",
                "description": "Ahri sends out and pulls back her orb, dealing magic damage on the way out and true damage on the way back. Ahri gains movement speed that decays while her orb is traveling.",
                "image": {
                    "full": "AhriOrbofDeception.png",
                    "sprite": "spell0.png",
                    "group": "spell",
                    "x": 384,
                    "y": 48,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Fox-Fire",
                "description": "Ahri releases three fox-fires, that lock onto and attack nearby enemies.",
                "image": {
                    "full": "AhriFoxFire.png",
                    "sprite": "spell0.png",
                    "group": "spell",
                    "x": 432,
                    "y": 48,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Charm",
                "description": "Ahri blows a kiss that damages and charms an enemy it encounters, causing them to walk harmlessly towards her.",
                "image": {
                    "full": "AhriSeduce.png",
                    "sprite": "spell0.png",
                    "group": "spell",
                    "x": 0,
                    "y": 96,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Spirit Rush",
                "description": "Ahri dashes forward and fires essence bolts, damaging 3 nearby enemies (prioritizes Champions). Spirit Rush can be cast up to three times before going on cooldown.",
                "image": {
                    "full": "AhriTumble.png",
                    "sprite": "spell0.png",
                    "group": "spell",
                    "x": 48,
                    "y": 96,
                    "w": 48,
                    "h": 48
                }
            }],
            "passive": {
                "name": "Essence Theft",
                "description": "Gains a charge of Essence Theft whenever a spell hits an enemy (max: 3 charges per spell). Upon reaching 9 charges, Ahri's next spell heals her whenever it hits an enemy.",
                "image": {
                    "full": "Ahri_SoulEater.png",
                    "sprite": "passive0.png",
                    "group": "passive",
                    "x": 48,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            }
        }
    }, {
        "summonerSpells": {
            "0": {
                "name": "Heal",
                "description": "Restores 90-345 Health (depending on champion level) and grants 30% Movement Speed for 1 second to you and target allied champion. This healing is halved for units recently affected by Summoner Heal.",
                "cooldown": [240],
                "range": [850],
                "image": {
                    "full": "SummonerHeal.png",
                    "sprite": "spell0.png",
                    "group": "spell",
                    "x": 336,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            },
            "1": {
                "name": "Flash",
                "description": "Teleports your champion a short distance toward your cursor's location.",
                "cooldown": [300],
                "range": [425],
                "image": {
                    "full": "SummonerFlash.png",
                    "sprite": "spell0.png",
                    "group": "spell",
                    "x": 240,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            }
        },
        "champ": {
            "name": "Tristana",
            "title": "the Yordle Gunner",
            "image": {
                "full": "Tristana.png",
                "sprite": "champion3.png",
                "group": "champion",
                "x": 384,
                "y": 0,
                "w": 48,
                "h": 48
            },
            "allytips": ["Her massive gun allows Tristana to fire on targets at a great distance. Utilize this to prevent your enemies from ever laying a hand on you.", "Use Rocket Jump after you have stacked up your Explosive Charge on an enemy to finish them off with a burst of damage.", "Use Rapid Fire to help stack up your Explosive Charge on enemy champions."],
            "enemytips": ["If you see Tristana activate Rapid Fire in a fight, stun her and try to back off until the spell dissipates.", "Stand away from your creeps in a lane to take less collateral damage from Explosive Charge."],
            "spells": [{
                "name": "Rapid Fire",
                "description": "Tristana fires her weapon rapidly, increasing her Attack Speed for a short time. Shooting enemies marked with Explosive Charge reduces the cooldown by a small amount each hit.",
                "image": {
                    "full": "TristanaQ.png",
                    "sprite": "spell11.png",
                    "group": "spell",
                    "x": 48,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Rocket Jump",
                "description": "Tristana fires at the ground to propel her to a distant location, dealing damage and slowing surrounding units for a brief period where she lands.",
                "image": {
                    "full": "TristanaW.png",
                    "sprite": "spell11.png",
                    "group": "spell",
                    "x": 96,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Explosive Charge",
                "description": "When Tristana kills a unit, her cannonballs burst into shrapnel, dealing damage to surrounding enemies. Can be activated to place a bomb on a target enemy that explodes after a short duration dealing damage to surrounding units.",
                "image": {
                    "full": "TristanaE.png",
                    "sprite": "spell11.png",
                    "group": "spell",
                    "x": 144,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Buster Shot",
                "description": "Tristana loads a massive cannonball into her weapon and fires it at an enemy unit. This deals Magic Damage and knocks the target back.",
                "image": {
                    "full": "TristanaR.png",
                    "sprite": "spell11.png",
                    "group": "spell",
                    "x": 192,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            }],
            "passive": {
                "name": "Draw a Bead",
                "description": "Increases Tristana's Attack Range as she levels.",
                "image": {
                    "full": "Tristana_Passive.png",
                    "sprite": "passive3.png",
                    "group": "passive",
                    "x": 384,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            }
        }
    }],
    "purple": [{
        "summonerSpells": {
            "0": {
                "name": "Barrier",
                "description": "Shields your champion for 115-455 (depending on champion level) for 2 seconds.",
                "cooldown": [210],
                "range": "self",
                "image": {
                    "full": "SummonerBarrier.png",
                    "sprite": "spell0.png",
                    "group": "spell",
                    "x": 0,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            },
            "1": {
                "name": "Flash",
                "description": "Teleports your champion a short distance toward your cursor's location.",
                "cooldown": [300],
                "range": [425],
                "image": {
                    "full": "SummonerFlash.png",
                    "sprite": "spell0.png",
                    "group": "spell",
                    "x": 240,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            }
        },
        "champ": {
            "name": "Jayce",
            "title": "the Defender of Tomorrow",
            "image": {
                "full": "Jayce.png",
                "sprite": "champion1.png",
                "group": "champion",
                "x": 384,
                "y": 0,
                "w": 48,
                "h": 48
            },
            "allytips": ["Be sure to switch stances often. It will enhance your attacks and grant you quick bursts of speed.", "If you find yourself taking lots of damage, try using Jayce's Hammer Stance, as it grants you additional defenses.", "For increased range and damage, try casting Shock Blast through the Acceleration Gate."],
            "enemytips": ["Jayce can attack in melee or at range. Pay attention to his stance and weapon color to know how he is going to attack.", "If you see Jayce drop his Acceleration Gate, be careful, he is probably about to cast Shock Blast.", "Jayce is strong in the early game. If he gains the advantage, play defensively."],
            "spells": [{
                "name": "To the Skies! / Shock Blast",
                "description": "Hammer Stance: Leaps to an enemy dealing physical damage and slowing enemies.<br><br>Cannon Stance: Fires an orb of electricity that detonates upon hitting an enemy (or reaching the end of its path) dealing physical damage to all enemies in the area of the explosion.",
                "image": {
                    "full": "JayceToTheSkies.png",
                    "sprite": "spell4.png",
                    "group": "spell",
                    "x": 336,
                    "y": 48,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Lightning Field / Hyper Charge",
                "description": "Hammer Stance: Passive: Restores Mana per strike. Active: Creates a field of lightning damaging nearby enemies for several seconds.<br><br>Cannon Stance: Gains a burst of energy, increasing Attack Speed to maximum for several attacks.",
                "image": {
                    "full": "JayceStaticField.png",
                    "sprite": "spell4.png",
                    "group": "spell",
                    "x": 384,
                    "y": 48,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Thundering Blow / Acceleration Gate",
                "description": "Hammer Stance: Deals magic damage to an enemy and knocks them back a short distance.<br><br>Cannon Stance: Deploys an Acceleration Gate increasing the Movement Speed of all allied champions who pass through it. If Shock Blast is fired through the gate the missile speed, range, and damage will increase.",
                "image": {
                    "full": "JayceThunderingBlow.png",
                    "sprite": "spell4.png",
                    "group": "spell",
                    "x": 432,
                    "y": 48,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Mercury Cannon / Mercury Hammer",
                "description": "Hammer Stance: Transforms the Mercury Hammer into the Mercury Cannon gaining new abilities and increased range. The first attack in this form reduces the target's Armor and Magic Resist.<br><br>Cannon Stance: Transforms the Mercury Cannon into the Mercury Hammer gaining new abilities and increasing Armor and Magic Resist. The first attack in this form deals additional magic damage.",
                "image": {
                    "full": "JayceStanceHtG.png",
                    "sprite": "spell4.png",
                    "group": "spell",
                    "x": 0,
                    "y": 96,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Shock Blast",
                "description": "Fires an orb of electricity that detonates upon hitting an enemy (or reaching the end of its path) dealing physical damage to all enemies in the area of the explosion.",
                "image": {
                    "full": "JayceShockBlast.png",
                    "sprite": "spell4.png",
                    "group": "spell",
                    "x": 48,
                    "y": 96,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Hyper Charge",
                "description": "Gains a burst of energy increasing Attack Speed to maximum for several attacks.",
                "image": {
                    "full": "JayceHyperCharge.png",
                    "sprite": "spell4.png",
                    "group": "spell",
                    "x": 96,
                    "y": 96,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Acceleration Gate",
                "description": "Deploys an Acceleration Gate increasing the Movement Speed of all allied champions who pass through it.<br>If Shock Blast is fired through the gate the missile speed, range, and damage will increase.",
                "image": {
                    "full": "JayceAccelerationGate.png",
                    "sprite": "spell4.png",
                    "group": "spell",
                    "x": 144,
                    "y": 96,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Mercury Hammer",
                "description": "Transforms the Mercury Cannon into the Mercury Hammer gaining new abilities and increasing Armor and Magic Resist. The first attack in this form deals additional magic damage.",
                "image": {
                    "full": "JayceStanceGtH.png",
                    "sprite": "spell4.png",
                    "group": "spell",
                    "x": 192,
                    "y": 96,
                    "w": 48,
                    "h": 48
                }
            }],
            "passive": {
                "name": "Hextech Capacitor",
                "description": "Gains 40 Movement Speed for 1.25 seconds and can move through units each time Transform is cast.",
                "image": {
                    "full": "Jayce_Passive.png",
                    "sprite": "passive1.png",
                    "group": "passive",
                    "x": 384,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            }
        }
    }, {
        "summonerSpells": {
            "0": {
                "name": "Flash",
                "description": "Teleports your champion a short distance toward your cursor's location.",
                "cooldown": [300],
                "range": [425],
                "image": {
                    "full": "SummonerFlash.png",
                    "sprite": "spell0.png",
                    "group": "spell",
                    "x": 240,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            },
            "1": {
                "name": "Heal",
                "description": "Restores 90-345 Health (depending on champion level) and grants 30% Movement Speed for 1 second to you and target allied champion. This healing is halved for units recently affected by Summoner Heal.",
                "cooldown": [240],
                "range": [850],
                "image": {
                    "full": "SummonerHeal.png",
                    "sprite": "spell0.png",
                    "group": "spell",
                    "x": 336,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            }
        },
        "champ": {
            "name": "Jinx",
            "title": "the Loose Cannon",
            "image": {
                "full": "Jinx.png",
                "sprite": "champion1.png",
                "group": "champion",
                "x": 432,
                "y": 0,
                "w": 48,
                "h": 48
            },
            "allytips": ["Rockets aren't always the best choice! Jinx's minigun is incredibly powerful when fully ramped up. Switch to it whenever an enemy champion gets too close.", "Jinx's rockets deal full damage to all enemies in the explosion. Use them on minions in lane to hit nearby enemy champions without drawing minion aggro.", "When a fight starts try to stay on the edge of fray by poking with rockets and Zap!. Do not run in and unload with the minigun until you feel it is safe."],
            "enemytips": ["Jinx's minigun takes time to ramp up. If you see her poking with rockets try to jump on her and burst her down.", "Jinx's ultimate does less damage the closer you are to her.", "Jinx's snare grenades have a long cooldown and are her primary means of protecting herself. If she misses with them she will have a hard time escaping if engaged upon. "],
            "spells": [{
                "name": "Switcheroo!",
                "description": "Jinx modifies her basic attacks by swapping between Pow-Pow, her minigun and Fishbones, her rocket launcher. Attacks with Pow-Pow grant Attack Speed, while attacks with Fishbones deal area of effect damage, gain increased range, and drain Mana.",
                "image": {
                    "full": "JinxQ.png",
                    "sprite": "spell4.png",
                    "group": "spell",
                    "x": 240,
                    "y": 96,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Zap!",
                "description": "Jinx uses Zapper, her shock pistol, to fire a blast that deals damage to the first enemy hit, slowing and revealing it if it is not stealthed.",
                "image": {
                    "full": "JinxW.png",
                    "sprite": "spell4.png",
                    "group": "spell",
                    "x": 288,
                    "y": 96,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Flame Chompers!",
                "description": "Jinx throws out a line of snare grenades that explode after 5 seconds, lighting enemies on fire. Flame Chompers will bite enemy champions who walk over them, rooting them in place.",
                "image": {
                    "full": "JinxE.png",
                    "sprite": "spell4.png",
                    "group": "spell",
                    "x": 336,
                    "y": 96,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Super Mega Death Rocket!",
                "description": "Jinx fires a super rocket across the map that gains damage as it travels. The rocket will explode upon colliding with an enemy champion, dealing damage to it and surrounding enemies based on their missing Health. ",
                "image": {
                    "full": "JinxR.png",
                    "sprite": "spell4.png",
                    "group": "spell",
                    "x": 384,
                    "y": 96,
                    "w": 48,
                    "h": 48
                }
            }],
            "passive": {
                "name": "Get Excited!",
                "description": "Jinx receives massively increased Movement Speed whenever she damages an enemy champion, tower, or inhibitor that is then killed or destroyed within 3 seconds.",
                "image": {
                    "full": "Jinx_Passive.png",
                    "sprite": "passive1.png",
                    "group": "passive",
                    "x": 432,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            }
        }
    }, {
        "summonerSpells": {
            "0": {
                "name": "Exhaust",
                "description": "Exhausts target enemy champion, reducing their Movement Speed and Attack Speed by 30%, their Armor and Magic Resist by 10, and their damage dealt by 40% for 2.5 seconds.",
                "cooldown": [210],
                "range": [650],
                "image": {
                    "full": "SummonerExhaust.png",
                    "sprite": "spell0.png",
                    "group": "spell",
                    "x": 192,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            },
            "1": {
                "name": "Flash",
                "description": "Teleports your champion a short distance toward your cursor's location.",
                "cooldown": [300],
                "range": [425],
                "image": {
                    "full": "SummonerFlash.png",
                    "sprite": "spell0.png",
                    "group": "spell",
                    "x": 240,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            }
        },
        "champ": {
            "name": "Thresh",
            "title": "the Chain Warden",
            "image": {
                "full": "Thresh.png",
                "sprite": "champion3.png",
                "group": "champion",
                "x": 336,
                "y": 0,
                "w": 48,
                "h": 48
            },
            "allytips": ["Communication is key when making use of Thresh's lantern. Let your teammates know how you like to use it.", "Death Sentence and Flay can be combined in either cast order for powerful combinations.", "Thresh can collect souls without needing to kill units himself. Planning your map position to be near the most deaths will help to maximize soul collection."],
            "enemytips": ["Thresh's Death Sentence has a long cast time. Watch for the cast to begin to take evasive actions.", "Intentionally breaking a wall of The Box can allow a vulnerable ally to escape unscathed.", "Thresh relies on collecting souls for a portion of his defense and damage. Try punishing him when he moves to collect them."],
            "spells": [{
                "name": "Death Sentence",
                "description": "Thresh binds an enemy in chains and pulls them toward him. Activating this ability a second time pulls Thresh to the enemy.",
                "image": {
                    "full": "ThreshQ.png",
                    "sprite": "spell10.png",
                    "group": "spell",
                    "x": 336,
                    "y": 144,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Dark Passage",
                "description": "Thresh throws out a lantern that shields nearby allied Champions from damage. Allies can click the lantern to dash to Thresh.",
                "image": {
                    "full": "ThreshW.png",
                    "sprite": "spell10.png",
                    "group": "spell",
                    "x": 384,
                    "y": 144,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Flay",
                "description": "Thresh's attacks wind up, dealing more damage the longer he waits between attacks. When activated, Thresh sweeps his chain, knocking all enemies hit in the direction of the blow.",
                "image": {
                    "full": "ThreshE.png",
                    "sprite": "spell10.png",
                    "group": "spell",
                    "x": 432,
                    "y": 144,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "The Box",
                "description": "A prison of walls that slow and deal damage if broken.",
                "image": {
                    "full": "ThreshRPenta.png",
                    "sprite": "spell11.png",
                    "group": "spell",
                    "x": 0,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            }],
            "passive": {
                "name": "Damnation",
                "description": "Thresh can harvest the souls of enemies that die near him, permanently granting him Armor and Ability Power.",
                "image": {
                    "full": "Thresh_Passive.png",
                    "sprite": "passive3.png",
                    "group": "passive",
                    "x": 336,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            }
        }
    }, {
        "summonerSpells": {
            "0": {
                "name": "Flash",
                "description": "Teleports your champion a short distance toward your cursor's location.",
                "cooldown": [300],
                "range": [425],
                "image": {
                    "full": "SummonerFlash.png",
                    "sprite": "spell0.png",
                    "group": "spell",
                    "x": 240,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            },
            "1": {
                "name": "Ignite",
                "description": "Ignites target enemy champion, dealing 70-410 true damage (depending on champion level) over 5 seconds, grants you vision of the target, and reduces healing effects on them for the duration.",
                "cooldown": [180],
                "range": [600],
                "image": {
                    "full": "SummonerDot.png",
                    "sprite": "spell0.png",
                    "group": "spell",
                    "x": 144,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            }
        },
        "champ": {
            "name": "Swain",
            "title": "the Master Tactician",
            "image": {
                "full": "Swain.png",
                "sprite": "champion3.png",
                "group": "champion",
                "x": 96,
                "y": 0,
                "w": 48,
                "h": 48
            },
            "allytips": ["If you're having trouble rooting an enemy with Nevermove, try using Decrepify to slow them down first.", "While laning, try to gauge the strength of your opponents to determine the right balance of aggression with Ravenous Flock. If they're stronger, it might be more beneficial to stay back and cast Nevermove or Torment."],
            "enemytips": ["Swain can easily disable a single attacker. Coordinate with your allies when ganking him.", "High mobility counters all of Swain's basic abilities: moving away from the Raven will break the slow, it is easier to dodge Nevermove, and you're able to escape focus fire while Tormented."],
            "spells": [{
                "name": "Decrepify",
                "description": "Swain sets his raven to cripple an enemy. Over the next 3 seconds, the target is damaged and slowed.",
                "image": {
                    "full": "SwainDecrepify.png",
                    "sprite": "spell10.png",
                    "group": "spell",
                    "x": 336,
                    "y": 48,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Nevermove",
                "description": "Swain marks a target area. After a short delay, mighty talons grab hold of enemy units, dealing damage and rooting them.",
                "image": {
                    "full": "SwainShadowGrasp.png",
                    "sprite": "spell10.png",
                    "group": "spell",
                    "x": 384,
                    "y": 48,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Torment",
                "description": "Swain afflicts his target, dealing damage to them over time and causing them to take increased damage from Swain.",
                "image": {
                    "full": "SwainTorment.png",
                    "sprite": "spell10.png",
                    "group": "spell",
                    "x": 432,
                    "y": 48,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Ravenous Flock",
                "description": "Swain inspires dread in his enemies by temporarily taking the form of a raven. During this time ravens strike out at up to 3 nearby enemies. Each raven deals damage and heals Swain for half of the damage dealt.",
                "image": {
                    "full": "SwainMetamorphism.png",
                    "sprite": "spell10.png",
                    "group": "spell",
                    "x": 0,
                    "y": 96,
                    "w": 48,
                    "h": 48
                }
            }],
            "passive": {
                "name": "Carrion Renewal",
                "description": "Swain regenerates Mana each time he kills a unit. This amount increases each level.",
                "image": {
                    "full": "SwainCarrionRenewal.png",
                    "sprite": "passive3.png",
                    "group": "passive",
                    "x": 96,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            }
        }
    }, {
        "summonerSpells": {
            "0": {
                "name": "Smite",
                "description": "Deals 390-1000 true damage (depending on champion level) to target epic or large monster or enemy minion.",
                "cooldown": [90],
                "range": [500],
                "image": {
                    "full": "SummonerSmite.png",
                    "sprite": "spell0.png",
                    "group": "spell",
                    "x": 96,
                    "y": 48,
                    "w": 48,
                    "h": 48
                }
            },
            "1": {
                "name": "Flash",
                "description": "Teleports your champion a short distance toward your cursor's location.",
                "cooldown": [300],
                "range": [425],
                "image": {
                    "full": "SummonerFlash.png",
                    "sprite": "spell0.png",
                    "group": "spell",
                    "x": 240,
                    "y": 0,
                    "w": 48,
                    "h": 48
                }
            }
        },
        "champ": {
            "name": "Elise",
            "title": "The Spider Queen",
            "image": {
                "full": "Elise.png",
                "sprite": "champion0.png",
                "group": "champion",
                "x": 0,
                "y": 96,
                "w": 48,
                "h": 48
            },
            "allytips": ["Spider Form is most effective at finishing off enemies with low health; Human Form's Neurotoxin does more damage to healthy foes. ", "When in Spider Form, Spiderlings will attack the target that Elise uses Venomous Bite on. ", "Elise's Spider Form and Spider Form abilities do not cost mana and can be prioritized when you are trying to conserve mana."],
            "enemytips": ["Elise's Spider Form is more dangerous when you are at low health, and her Human Form more potent when you are at high health.", "Rappel will only move Elise straight up and down unless she can descend upon an enemy unit.", "Rappel has a long cooldown. Elise is vulnerable after she has used it."],
            "spells": [{
                "name": "Neurotoxin / Venomous Bite",
                "description": "Human Form: Deals damage based upon how high the target's Health is.<br><br>Spider Form: Lunges at an enemy and deals damage based upon how low their Health is.",
                "image": {
                    "full": "EliseHumanQ.png",
                    "sprite": "spell2.png",
                    "group": "spell",
                    "x": 240,
                    "y": 48,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Volatile Spiderling / Skittering Frenzy",
                "description": "Human Form: Releases a venom-gorged Spiderling that explodes when it nears a target.<br><br>Spider Form: Elise and her Spiderlings gain Attack Speed.",
                "image": {
                    "full": "EliseHumanW.png",
                    "sprite": "spell2.png",
                    "group": "spell",
                    "x": 336,
                    "y": 48,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Cocoon / Rappel",
                "description": "Human Form: Stuns the first enemy unit hit and reveals them if they are not stealthed.<br><br>Spider Form: Elise and her Spiderlings ascend into the air and then descend upon target enemy.",
                "image": {
                    "full": "EliseHumanE.png",
                    "sprite": "spell2.png",
                    "group": "spell",
                    "x": 432,
                    "y": 48,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Spider Form",
                "description": "Transforms into a menacing spider, reducing her attack range in exchange for movement speed, new abilities, and a Spiderling swarm that will attack her foes.",
                "image": {
                    "full": "EliseR.png",
                    "sprite": "spell2.png",
                    "group": "spell",
                    "x": 48,
                    "y": 96,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Venomous Bite / Neurotoxin",
                "description": "Spider Form: Lunges at an enemy and deals damage based upon how low their Health is.<br><br>Human Form: Deals damage based upon how high the target's Health is.",
                "image": {
                    "full": "EliseSpiderQCast.png",
                    "sprite": "spell2.png",
                    "group": "spell",
                    "x": 96,
                    "y": 96,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Skittering Frenzy / Volatile Spiderling",
                "description": "Elise and her Spiderlings gain a burst of Attack Speed.",
                "image": {
                    "full": "EliseSpiderW.png",
                    "sprite": "spell2.png",
                    "group": "spell",
                    "x": 144,
                    "y": 96,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Rappel / Cocoon",
                "description": "Ascends into the air, briefly becoming untargetable, and then descends upon an enemy.",
                "image": {
                    "full": "EliseSpiderEInitial.png",
                    "sprite": "spell2.png",
                    "group": "spell",
                    "x": 192,
                    "y": 96,
                    "w": 48,
                    "h": 48
                }
            }, {
                "name": "Human Form",
                "description": "Transforms into Human Form, removing Spider Form bonuses but granting the ability to generate new Spiderlings by casting spells.",
                "image": {
                    "full": "EliseRSpider.png",
                    "sprite": "spell2.png",
                    "group": "spell",
                    "x": 240,
                    "y": 96,
                    "w": 48,
                    "h": 48
                }
            }],
            "passive": {
                "name": "Spider Queen",
                "description": "Human Form: When Elise's mage abilities hit an enemy, she gains a dormant Spiderling.<br><br>Spider Form: Basic attacks deal bonus magic damage and restore health to Elise.",
                "image": {
                    "full": "ElisePassive.png",
                    "sprite": "passive0.png",
                    "group": "passive",
                    "x": 0,
                    "y": 96,
                    "w": 48,
                    "h": 48
                }
            }
        }
    }]
};