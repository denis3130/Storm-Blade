// Copyright Epic Games, Inc. All Rights Reserved.

using UnrealBuildTool;

public class StormBlade : ModuleRules
{
	public StormBlade(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

		PublicDependencyModuleNames.AddRange(new string[] {
			"Core",
			"CoreUObject",
			"Engine",
			"InputCore",
			"EnhancedInput",
			"AIModule",
			"StateTreeModule",
			"GameplayStateTreeModule",
			"UMG",
			"Slate"
		});

		PrivateDependencyModuleNames.AddRange(new string[] { });

		PublicIncludePaths.AddRange(new string[] {
			"StormBlade",
			"StormBlade/Variant_Platforming",
			"StormBlade/Variant_Platforming/Animation",
			"StormBlade/Variant_Combat",
			"StormBlade/Variant_Combat/AI",
			"StormBlade/Variant_Combat/Animation",
			"StormBlade/Variant_Combat/Gameplay",
			"StormBlade/Variant_Combat/Interfaces",
			"StormBlade/Variant_Combat/UI",
			"StormBlade/Variant_SideScrolling",
			"StormBlade/Variant_SideScrolling/AI",
			"StormBlade/Variant_SideScrolling/Gameplay",
			"StormBlade/Variant_SideScrolling/Interfaces",
			"StormBlade/Variant_SideScrolling/UI"
		});

		// Uncomment if you are using Slate UI
		// PrivateDependencyModuleNames.AddRange(new string[] { "Slate", "SlateCore" });

		// Uncomment if you are using online features
		// PrivateDependencyModuleNames.Add("OnlineSubsystem");

		// To include OnlineSubsystemSteam, add it to the plugins section in your uproject file with the Enabled attribute set to true
	}
}
